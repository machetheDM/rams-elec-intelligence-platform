# Zero Trust Architecture Implementation Guide — Rams @Elec

**Module 4C of SecureDevOps Pipeline**
**Extends**: Machethe, D.M. (2026) — Published MSc Research on ZTA
**Reference**: NIST SP 800-207 — Zero Trust Architecture
**Date**: July 2026

---

## Executive Summary

This guide maps each NIST SP 800-207 Zero Trust Architecture (ZTA) pillar to specific Azure security controls in the Rams @Elec Intelligence Platform. It extends the author's published MSc research from theoretical ZTA framework to practical Azure implementation — a direct bridge between academic research and cloud security engineering.

---

## ZTA Pillar 1 — Identity

**Principle**: Never trust, always verify. Every access request must be authenticated and authorised.

### Current State (Before Hardening)
- NextAuth v5 with email/password — single-factor
- No MFA
- No device trust
- FastAPI services had no authentication

### Target State (Azure Implementation)

| Control | Azure Service | Implementation |
|---------|--------------|----------------|
| Multi-Factor Authentication | Entra ID Conditional Access | MFA required for all admin/technician accounts |
| Passwordless authentication | Entra ID + Microsoft Authenticator | FIDO2 security keys for admin accounts |
| Just-in-Time access | Entra ID PIM | Elevate privileges only when needed, max 4 hours |
| Continuous access evaluation | Entra ID CAE | Real-time token revocation on risk detection |
| Identity protection | Entra ID Protection | Risk-based Conditional Access (block high-risk sign-ins) |

### Implementation Steps
1. Register Rams @Elec as an Entra ID Enterprise Application
2. Configure Conditional Access: MFA for all users, block legacy auth, geo-fence to ZA
3. Enable Entra ID Protection for risk-based sign-in policies
4. Migrate NextAuth to use Entra ID as OIDC provider
5. Implement Managed Identity for all service-to-service auth

### Verification
- Attempt login without MFA → blocked
- Attempt login from outside ZA → blocked
- Attempt login with legacy protocol → blocked
- Service-to-service call without Managed Identity → denied

---

## ZTA Pillar 2 — Devices

**Principle**: Device health and compliance must be verified before granting access.

### Current State
- No device posture assessment
- Any device can access the platform

### Target State (Azure Implementation)

| Control | Azure Service | Implementation |
|---------|--------------|----------------|
| Device compliance | Intune | Require compliant device for admin/technician access |
| Device health | Defender for Endpoint | Risk score integrated with Conditional Access |
| Mobile device management | Intune MAM | App protection policies for mobile access |

### Implementation Steps
1. Enroll technician devices in Intune
2. Create device compliance policy: encryption, OS version, no jailbreak
3. Configure Conditional Access: require compliant device for technician role
4. Deploy Defender for Endpoint for threat detection on endpoints

### Verification
- Access from non-compliant device → blocked
- Access from compromised device (Defender alert) → session revoked

---

## ZTA Pillar 3 — Networks

**Principle**: Network location does not imply trust. Micro-segmentation and encryption everywhere.

### Current State
- Docker Compose on single host — no network segmentation
- All services on same network
- No encryption between containers

### Target State (Azure Implementation)

| Control | Azure Service | Implementation |
|---------|--------------|----------------|
| Micro-segmentation | NSGs + Subnets | 4 subnets with strict NSG rules |
| Private Endpoints | Azure Private Link | All PaaS services on private IPs only |
| DDoS Protection | Azure DDoS Protection Standard | Always-on traffic monitoring |
| Traffic encryption | TLS 1.3 | All external + internal traffic encrypted |
| Network monitoring | NSG Flow Logs + Traffic Analytics | All network flows logged to Sentinel |

### Implementation Steps
1. Deploy VNet with 4 subnets (public, private, data, management)
2. Configure NSGs with deny-all-default + explicit allow rules
3. Deploy Private Endpoints for PostgreSQL, Redis, Key Vault
4. Enable NSG Flow Logs → Log Analytics → Sentinel
5. Enable DDoS Protection Standard on VNet

### Verification
- Attempt direct internet access to PostgreSQL → blocked (Private Endpoint only)
- Attempt cross-subnet access violating NSG rules → blocked
- Review NSG Flow Logs in Sentinel → all flows accounted for

---

## ZTA Pillar 4 — Applications

**Principle**: Applications must be protected at the request level — WAF, API auth, input validation.

### Current State
- No WAF
- CORS allow all origins
- No API authentication
- No rate limiting

### Target State (Azure Implementation)

| Control | Azure Service | Implementation |
|---------|--------------|----------------|
| Web Application Firewall | Application Gateway WAF v2 | OWASP 3.2 ruleset, prevention mode |
| API authentication | JWT + API Key middleware | All endpoints require auth (Module 2) |
| Rate limiting | WAF custom rules + API Management | 100 req/min per IP on triage endpoint |
| Input validation | Pydantic validators | Strict field validation on all inputs (Module 2) |
| DDoS protection | Azure Front Door + DDoS Protection | Layer 3/4 + Layer 7 protection |

### Implementation Steps
1. Deploy Application Gateway with WAF v2 in Public subnet
2. Configure OWASP 3.2 managed ruleset in prevention mode
3. Add custom WAF rules: rate limiting, geo-filtering
4. Route all traffic through Front Door → App Gateway → App Service
5. Apply JWT + API key middleware to all FastAPI services (done in Module 2)

### Verification
- Send SQL injection payload → WAF blocks (403)
- Send XSS payload → WAF blocks (403)
- Exceed rate limit → 429 Too Many Requests
- Access API without auth → 401 Unauthorized

---

## ZTA Pillar 5 — Data

**Principle**: Data must be classified, encrypted, and access-controlled at all times.

### Current State
- No data classification
- Database credentials in docker-compose.yml
- No encryption at rest configuration
- No data loss prevention

### Target State (Azure Implementation)

| Control | Azure Service | Implementation |
|---------|--------------|----------------|
| Encryption at rest | TDE + Azure Disk Encryption | AES-256 on all data stores |
| Encryption in transit | TLS 1.3 | All connections encrypted |
| Key management | Key Vault + Managed HSM | Auto-rotation, RBAC, audit logging |
| Data classification | Azure Information Protection | Labels: Public, Internal, Confidential, Restricted |
| Database audit | PostgreSQL audit logging | All queries logged to Log Analytics |
| Secrets management | Key Vault | No hardcoded credentials anywhere |

### Implementation Steps
1. Enable TDE on PostgreSQL Flexible Server
2. Store all secrets in Key Vault (DB password, API keys, JWT secret)
3. Configure Managed Identity for passwordless DB access
4. Enable PostgreSQL audit logging → Log Analytics
5. Apply data classification labels to all data stores
6. Configure Key Vault auto-rotation for all secrets

### Verification
- Check PostgreSQL → TDE enabled
- Check Key Vault → all secrets present, rotation configured
- Attempt DB access with hardcoded password → denied (Managed Identity only)
- Query audit logs → all access logged

---

## ZTA Maturity Assessment

| Pillar | Current Maturity | Target Maturity | Progress |
|--------|-----------------|-----------------|----------|
| Identity | Level 1 (Initial) | Level 3 (Optimized) | Module 2 implemented |
| Devices | Level 0 (None) | Level 2 (Defined) | Architecture designed |
| Networks | Level 0 (None) | Level 3 (Optimized) | Terraform IaC ready |
| Applications | Level 1 (Initial) | Level 2 (Defined) | Module 2 + 3 implemented |
| Data | Level 1 (Initial) | Level 2 (Defined) | Architecture designed |

---

## References

- NIST SP 800-207: https://csrc.nist.gov/publications/detail/sp/800-207/final
- Machethe, D.M. (2026). "Zero Trust Architecture in Cloud-Native Applications." ECCU Cyber Journal.
- Microsoft Zero Trust Deployment Guide: https://learn.microsoft.com/en-us/security/zero-trust/
- CISA Zero Trust Maturity Model: https://www.cisa.gov/zero-trust-maturity-model
