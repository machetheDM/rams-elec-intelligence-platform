# Security Incident Runbook — Rams @Elec Intelligence Platform

**Module 4D of SecureDevOps Pipeline**
**Reference**: NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide
**Date**: July 2026
**Status**: Academic project — not a production incident response plan

---

## Incident Response Team

| Role | Name | Contact |
|------|------|---------|
| Security Lead | Dingaan Mahlatse Machethe | ramsatelec@gmail.com |
| Platform Engineer | TBD | — |
| Legal / POPIA Officer | TBD | — |

---

## Scenario 1: SQL Injection Attempt Detected

### Detection
- **Source**: WAF alert (Application Gateway) → Sentinel incident
- **Alert name**: "SQL Injection Attempt — WAF Rule Trigger"
- **Severity**: High

### Response Steps

1. **Verify the alert** (5 minutes)
   - Check WAF logs in Log Analytics: `AzureDiagnostics | where ruleName contains "SQL"`
   - Identify source IP, target endpoint, payload
   - Confirm whether the attack was blocked (WAF in Prevention mode)

2. **Contain** (15 minutes)
   - If attack was blocked: no further containment needed — WAF prevented it
   - If attack was successful (unlikely with parameterised queries): immediately isolate affected service
   - Block source IP via NSG rule: `az network nsg rule create --name "block-attacker" --nsg-name private-nsg --priority 50 --access Deny --source-address-prefixes <ATTACKER_IP>`

3. **Investigate** (1 hour)
   - Query PostgreSQL audit logs for suspicious queries from the attack timeframe
   - Check if any data was exfiltrated: `SELECT * FROM security_audit_log WHERE source_ip = '<ATTACKER_IP>' AND timestamp > now() - interval '1 hour'`
   - Review application logs for error messages that may have leaked schema info

4. **Remediate** (2 hours)
   - Verify all queries use parameterised `text()` — already confirmed in Module 1 audit
   - If any raw SQL found, convert to parameterised immediately
   - Add additional WAF custom rule if a new attack pattern was identified

5. **Recover** (1 hour)
   - Verify service health: `curl https://api.ramsatelec.co.za/triage/health`
   - Run integration tests: `pytest services/`
   - Confirm normal traffic patterns resumed

6. **Post-Incident** (within 24 hours)
   - Document the attack vector and payload in incident report
   - Update WAF rules if new pattern identified
   - Brief the development team on findings

### Escalation Path
- Security Lead → Platform Engineer → Legal (if data breach confirmed)

---

## Scenario 2: Credential Stuffing Attack

### Detection
- **Source**: Sentinel alert — "Failed Authentication Spike"
- **Alert name**: "Multiple Failed Login Attempts"
- **Severity**: High
- **Threshold**: >10 failed logins from same IP in 5 minutes

### Response Steps

1. **Verify the alert** (5 minutes)
   - Query security audit log:
     ```sql
     SELECT source_ip, COUNT(*) as attempts, MIN(timestamp), MAX(timestamp)
     FROM security_audit_log
     WHERE event_type = 'AUTH_FAILURE'
       AND timestamp > now() - interval '15 minutes'
     GROUP BY source_ip
     HAVING COUNT(*) > 10
     ORDER BY attempts DESC
     ```

2. **Contain** (15 minutes)
   - **Auto-remediation** (SOAR playbook): Sentinel automatically triggers account lockout for targeted accounts
   - Block attacker IP via NSG rule
   - If attack is distributed (multiple IPs): enable rate limiting on login endpoint (if not already)

3. **Investigate** (30 minutes)
   - Identify targeted accounts
   - Check if any accounts were successfully compromised:
     ```sql
     SELECT * FROM security_audit_log
     WHERE event_type = 'AUTH_SUCCESS'
       AND source_ip IN (<ATTACKER_IPS>)
       AND timestamp > now() - interval '1 hour'
     ```
   - If any successes found → immediately force password reset for those accounts

4. **Remediate** (1 hour)
   - Force password reset for all targeted accounts
   - Notify affected users: "Unusual login activity detected on your account. Your password has been reset as a precaution."
   - Review account lockout policy: ensure 5 failures → 15-minute lockout is enforced
   - Consider enabling CAPTCHA on login page

5. **Recover** (30 minutes)
   - Verify login functionality for legitimate users
   - Monitor auth logs for 24 hours for recurrence

6. **Post-Incident** (within 24 hours)
   - Document attack pattern, targeted accounts, response effectiveness
   - Consider implementing breached password detection (HaveIBeenPwned API)

### Escalation Path
- Security Lead → notify affected users → Legal (if customer accounts compromised)

---

## Scenario 3: Data Exfiltration Attempt

### Detection
- **Source**: Sentinel alert — "Unusual Data Volume"
- **Alert name**: "Potential Data Exfiltration"
- **Severity**: Critical
- **Threshold**: >10x normal data transfer volume from database

### Response Steps

1. **Verify the alert** (5 minutes)
   - Check PostgreSQL metrics in Azure Monitor: connection count, data transfer volume
   - Identify source of unusual activity: which service/user/IP
   - Query recent large queries:
     ```sql
     SELECT query, calls, total_time, rows
     FROM pg_stat_statements
     ORDER BY total_time DESC
     LIMIT 10
     ```

2. **Contain** (15 minutes)
   - **Immediate**: Revoke affected Managed Identity or user's database access
   - Isolate affected service: stop the App Service if compromise confirmed
   - Block egress from Data subnet to internet (already blocked by NSG — verify)

3. **Investigate** (2 hours)
   - Determine what data was accessed:
     ```sql
     SELECT * FROM security_audit_log
     WHERE user_id = '<AFFECTED_USER>'
       AND timestamp > now() - interval '24 hours'
     ORDER BY timestamp DESC
     ```
   - Classify exposed data: Public / Internal / Confidential / Restricted
   - Determine if POPIA notification is required

4. **POPIA Notification** (within 72 hours — SA law)
   - If **Confidential** or **Restricted** data was exposed:
     - Notify Information Regulator (South Africa): https://www.justice.gov.za/inforeg/
     - Notify affected data subjects
     - Document: what data, how many subjects, when discovered, containment actions
   - If only **Internal** data: document internally, no external notification required

5. **Remediate** (4 hours)
   - Rotate all database credentials
   - Rotate all API keys
   - Review and tighten RBAC permissions
   - Enable additional database auditing if gaps found

6. **Recover** (2 hours)
   - Restore service from clean state
   - Verify all security controls operational
   - Enhanced monitoring for 7 days

7. **Post-Incident** (within 1 week)
   - Full incident report with timeline
   - Root cause analysis
   - Preventive measures implemented
   - Board/management briefing if customer data affected

### Escalation Path
- Security Lead → Platform Engineer → Legal/POPIA Officer → Management

---

## Scenario 4: Vulnerable Dependency Found

### Detection
- **Source**: Dependabot alert / Safety scan / npm audit
- **Alert name**: "Vulnerable Dependency Detected"
- **Severity**: Medium to Critical (depends on CVE score)

### Response Steps

1. **Triage** (15 minutes)
   - Review CVE details: CVSS score, attack vector, exploitability
   - Determine if the vulnerable code path is reachable in Rams @Elec
   - Classify: Critical (CVSS ≥ 9.0) / High (7.0-8.9) / Medium (4.0-6.9) / Low (<4.0)

2. **Decision Matrix**:

   | CVSS Score | Reachable? | Action |
   |-----------|-----------|--------|
   | Critical | Yes | **Patch immediately** — deploy hotfix |
   | Critical | No | Patch in next sprint; document accepted risk |
   | High | Yes | Patch within 48 hours |
   | High | No | Patch in next sprint |
   | Medium | Yes | Patch in current sprint |
   | Medium | No | Patch when convenient |
   | Low | Any | Patch in regular maintenance window |

3. **Patch Deployment** (varies by severity)
   - Create fix branch: `git checkout -b security/CVE-YYYY-XXXXX`
   - Update dependency: `pip install package==fixed.version` or `npm update package`
   - Run tests: `pytest services/` + `npm test`
   - Run security scan to confirm fix: `bandit -r services/` or `npm audit`
   - Create PR with CVE reference in description
   - Deploy after review

4. **Verify** (30 minutes)
   - Confirm CVE no longer appears in scan results
   - Run integration tests
   - Monitor production for 24 hours for regressions

5. **Document** (15 minutes)
   - Update `security/dependencies/pinned_requirements.txt` with new version
   - If vulnerability accepted (not patched): document justification in `docs/security/secure-coding-implementation.md`

### Escalation Path
- Critical + reachable → Security Lead → immediate hotfix deployment
- Otherwise → standard sprint planning

---

## Incident Severity Classification

| Severity | Definition | Response Time | Notification |
|----------|-----------|---------------|-------------|
| **Critical** | Data breach, system compromise, active attack succeeding | 15 minutes | Full team + management + POPIA if applicable |
| **High** | Active attack blocked, vulnerability with known exploit | 1 hour | Security Lead + Platform Engineer |
| **Medium** | Suspicious activity, vulnerability without known exploit | 4 hours | Security Lead |
| **Low** | Informational alert, false positive investigation | Next business day | None required |

---

## References

- NIST SP 800-61 Rev 2: https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final
- POPIA Section 22: https://popia.co.za/
- OWASP Incident Response: https://owasp.org/www-project-incident-response/
