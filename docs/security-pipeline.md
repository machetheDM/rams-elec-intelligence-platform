# Secure CI/CD Pipeline — Rams @Elec DevSecOps

**Module 3 of SecureDevOps Pipeline**
**Reference**: OWASP SAMM (Software Assurance Maturity Model) — Verification
**Date**: July 2026

---

## Overview

The Rams @Elec Security Scan Pipeline runs automated security checks on every push to `main` and every pull request. It implements the **DevSecOps "shift-left"** principle — catching security issues before they reach production.

### Pipeline Triggers

| Trigger | Description |
|---------|-------------|
| `push` to `main`/`master` | Full scan on every merge |
| `pull_request` to `main`/`master` | Pre-merge security gate |
| `schedule` (weekly) | Monday 06:00 UTC — catch newly disclosed CVEs |
| `workflow_dispatch` | Manual trigger for ad-hoc scans |

---

## Pipeline Jobs

```
┌─────────────────────────────────────────────────────────────┐
│                  Security Scan Pipeline                      │
├───────────────┬───────────────┬───────────────┬─────────────┤
│  sast-python  │  sast-nodejs  │   secret-     │  container- │
│  (Bandit +    │  (npm audit   │   detection   │  security   │
│   Safety +    │   + ESLint    │  (detect-     │  (Trivy)    │
│   pip-audit)  │   security)   │   secrets +   │             │
│               │               │   truffleHog) │             │
├───────────────┴───────────────┴───────────────┴─────────────┤
│              dependency-review (PR only)                     │
├─────────────────────────────────────────────────────────────┤
│              security-report (summary + PR comment)          │
└─────────────────────────────────────────────────────────────┘
```

### Job 1: `sast-python` — Python Static Analysis

| Tool | Type | What it checks |
|------|------|---------------|
| **Bandit** | SAST | Python code for common security issues (hardcoded passwords, SQL injection, unsafe deserialization) |
| **Safety** | SCA | Python dependencies against known CVE database |
| **pip-audit** | SCA | Python dependencies against PyPA advisory database |

**Failure condition**: Bandit HIGH severity findings → pipeline fails.

### Job 2: `sast-nodejs` — Node.js Static Analysis

| Tool | Type | What it checks |
|------|------|---------------|
| **npm audit** | SCA | Node.js dependencies against npm advisory database |
| **ESLint + security plugin** | SAST | JavaScript/TypeScript for security anti-patterns (eval, child_process, object injection) |

**Failure condition**: npm audit HIGH severity → warning only (not fail — some CVEs have no fix yet).

### Job 3: `secret-detection` — Credential Scanning

| Tool | Type | What it checks |
|------|------|---------------|
| **detect-secrets** | Secret scan | Current codebase for API keys, tokens, passwords |
| **truffleHog** | Secret scan | Full git history for committed secrets |

**Failure condition**: Verified secrets found → pipeline fails.

### Job 4: `container-security` — Docker Image Scanning

| Tool | Type | What it checks |
|------|------|---------------|
| **Trivy** | Container scan | Docker images for OS packages and application dependency CVEs |

**Failure condition**: CRITICAL CVEs found → pipeline fails.

### Job 5: `dependency-review` — PR Dependency Audit

Runs only on pull requests. Uses GitHub's `dependency-review-action` to:
- Audit dependency changes introduced by the PR
- Block PRs that add dependencies with known HIGH severity vulnerabilities
- Post a summary comment on the PR

### Job 6: `security-report` — Unified Summary

Runs after all other jobs complete (even if some fail). Collects all reports and:
- Generates a unified markdown security summary
- Posts the summary as a PR comment (if triggered by PR)
- Uploads all reports as workflow artifacts (30-day retention)

---

## How to Interpret Findings

### Bandit Findings

```
Severity: HIGH | Confidence: HIGH
File: services/chatbot/main.py:73
Test: B301 (pickle)
Issue: Pickle and modules that wrap it can be unsafe when used to deserialize untrusted data
```

**Action**: Review the finding. If it's a false positive, add a `# nosec` comment with justification. If it's a real issue, fix it.

### Safety / pip-audit Findings

```
Package: requests==2.28.0
CVE: CVE-2023-32681
Severity: MEDIUM
Description: Requests may leak Proxy-Authorization headers
```

**Action**: Upgrade the package to the fixed version. If no fix is available, document the accepted risk in `security/dependencies/pinned_requirements.txt`.

### npm audit Findings

```
Package: next-auth
Severity: HIGH
Path: next-auth > jose > some-dep
```

**Action**: Run `npm audit fix` if safe. If the fix introduces breaking changes, document the accepted risk.

### detect-secrets Findings

```
File: docker-compose.yml:11
Type: Secret Keyword
Found: POSTGRES_PASSWORD=postgres
```

**Action**: If it's a real secret → rotate immediately and remove from code. If it's a false positive (e.g., example value), document why it's safe.

### Trivy Findings

```
CVE: CVE-2024-1234
Package: libssl3
Severity: CRITICAL
Fixed Version: 3.1.4
```

**Action**: Update the Docker base image or the affected package. Rebuild and re-scan.

---

## Suppressing False Positives

### Bandit

Add a `# nosec` comment on the specific line with justification:

```python
import pickle  # nosec B403 — used only for loading trusted model files, verified by checksum
```

### detect-secrets

Add an allowlist entry in `.secrets.baseline`:

```bash
detect-secrets scan --update .secrets.baseline
# Review the baseline and mark false positives
```

### Trivy

Add a `.trivyignore` file:

```
# Accepted: base image CVE, no fix available yet
CVE-2024-1234
```

---

## Security Badges

Add these to your README:

```markdown
[![Security Scan](https://github.com/machetheDM/rams-elec-intelligence-platform/actions/workflows/security.yml/badge.svg)](https://github.com/machetheDM/rams-elec-intelligence-platform/actions/workflows/security.yml)
[![SAST Python](https://github.com/machetheDM/rams-elec-intelligence-platform/actions/workflows/security.yml/badge.svg?job=sast-python)](https://github.com/machetheDM/rams-elec-intelligence-platform/actions/workflows/security.yml)
```

---

## OWASP SAMM Alignment

This pipeline maps to **OWASP SAMM v2 — Verification** practice:

| SAMM Activity | Maturity Level | Implementation |
|---------------|---------------|----------------|
| Security Testing (ST) | Level 2 — Automated | Bandit, ESLint security, Trivy in CI |
| Software Composition Analysis (SCA) | Level 2 — Automated | Safety, pip-audit, npm audit in CI |
| Secret Detection | Level 2 — Automated | detect-secrets + truffleHog in CI |
| Container Security | Level 2 — Automated | Trivy image scanning in CI |

**Target Maturity**: SAMM Level 2 (Defined) — security integrated into SDLC with automated scanning.

---

## References

- OWASP SAMM v2: https://owaspsamm.org/
- Bandit: https://bandit.readthedocs.io/
- Safety: https://pyup.io/safety/
- Trivy: https://github.com/aquasecurity/trivy
- detect-secrets: https://github.com/Yelp/detect-secrets
- truffleHog: https://github.com/trufflesecurity/trufflehog
