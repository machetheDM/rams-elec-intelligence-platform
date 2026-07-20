# Security Audit Report — Rams @Elec Intelligence Platform

**Audit Type**: OWASP Top 10 2021 + STRIDE Threat Model
**Date**: July 2026
**Auditor**: Dingaan Mahlatse Machethe (MSc Cybersecurity, ECCU)
**Context**: ECCU510 Secure Programming (CASE) + ECCU524 Cloud Security (CCSE)
**Disclaimer**: This is an academic security assessment demonstrating security engineering practices. It does not constitute a professional security audit.

---

## Executive Summary

The Rams @Elec Intelligence Platform is a microservices-based AI platform for electrical services management. A structured security audit against OWASP Top 10 2021 and STRIDE threat modelling revealed **5 critical**, **12 high**, **8 medium**, and **3 low** severity findings.

The platform has strong foundations (parameterised SQL queries, bcrypt password hashing, JWT sessions) but lacks essential security controls expected in production systems: API authentication, rate limiting, security headers, audit logging, and secrets management.

---

## Critical Findings (Fix Immediately)

### C1: `.env` File Potentially Exposed in Repository
- **Severity**: CRITICAL
- **Location**: Repository root `.env` (1396 bytes)
- **Risk**: API keys, database credentials, and secrets exposed if repository is public or compromised
- **Fix**: Remove `.env` from git history, ensure `.gitignore` is enforced, rotate all exposed credentials

### C2: Hardcoded Database Credentials
- **Severity**: CRITICAL
- **Location**: `docker-compose.yml:10-12`, all FastAPI `main.py` files
- **Risk**: Default `postgres:postgres` credentials allow full database access
- **Fix**: Use Docker secrets or environment variables with no defaults; rotate credentials

### C3: No Authentication on FastAPI Services
- **Severity**: CRITICAL
- **Location**: All 4 FastAPI services (triage, loadshedding, chatbot, dispatch)
- **Risk**: Any network-accessible attacker can call all API endpoints including job assignment
- **Fix**: Add JWT verification middleware to all services; implement RBAC

### C4: n8n Default Credentials
- **Severity**: CRITICAL
- **Location**: `docker-compose.yml:245-246`
- **Risk**: `admin:password` default credentials allow full workflow automation access
- **Fix**: Change to strong unique credentials; add IP restriction

### C5: FAISS Pickle Deserialization
- **Severity**: CRITICAL
- **Location**: `services/chatbot/main.py:73`
- **Risk**: `allow_dangerous_deserialization=True` enables remote code execution via malicious pickle files
- **Fix**: Replace pickle-based FAISS index with safe serialization format

---

## High Severity Findings (Fix Before Production)

### H1: CORS Allow All Origins
- **Location**: All FastAPI services (`allow_origins=["*"]`)
- **Fix**: Restrict to known frontend origins

### H2: Missing Security Headers
- **Location**: All services
- **Fix**: Add CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### H3: No Rate Limiting
- **Location**: All API endpoints
- **Fix**: Implement rate limiting (100 req/min per IP, 1000 req/min per API key)

### H4: No Account Lockout
- **Location**: `auth.config.ts`
- **Fix**: Lock account after 5 failed attempts for 15 minutes

### H5: No Password Policy
- **Location**: User registration flow
- **Fix**: Minimum 12 characters, complexity requirements

### H6: LLM Prompt Injection Vulnerability
- **Location**: `services/triage/main.py:193-198`, `services/chatbot/main.py:277-286`
- **Fix**: Sanitise user input before prompt injection; strip control characters

### H7: Customer PII Exposed via Unauthenticated API
- **Location**: `services/chatbot/main.py:127-173` (`get_customer_context`)
- **Fix**: Require authentication for customer data access

### H8: No Security Audit Logging
- **Location**: All services
- **Fix**: Implement structured JSON security audit logging

### H9: Missing MFA Support
- **Location**: Authentication flow
- **Fix**: Add TOTP-based MFA option

### H10: Docker Images Use `:latest` Tag
- **Location**: `docker-compose.yml:238` (n8n)
- **Fix**: Pin all image tags to specific versions

### H11: NextAuth Beta Version
- **Location**: `package.json` (`next-auth@^5.0.0-beta.25`)
- **Fix**: Monitor for stable release; test upgrade path

### H12: No JWT Token Expiry
- **Location**: `auth.config.ts`
- **Fix**: Set explicit token expiry (24h regular, 15min sensitive)

---

## Medium Severity Findings (Fix in Next Sprint)

### M1: Python Dependencies Not Pinned
- **Fix**: Pin all `requirements.txt` to exact versions

### M2: No CI/CD Security Scanning
- **Fix**: Add Bandit, Safety, npm audit, Trivy to CI pipeline

### M3: Error Messages May Leak Internals
- **Fix**: Custom error handlers with generic user-facing messages

### M4: No Database Audit Logging
- **Fix**: Enable PostgreSQL audit logging for sensitive tables

### M5: Health Endpoints Expose Service Details
- **Fix**: Reduce health endpoint detail in production

### M6: No Docker Resource Limits
- **Fix**: Add CPU/memory limits in docker-compose.yml

### M7: No Branch Protection Rules
- **Fix**: Enable GitHub branch protection on `main`

### M8: No Dependency Review Process
- **Fix**: Add Dependabot or Renovate

---

## Low Severity / Informational

### L1: No Certificate Pinning for External APIs
### L2: No GPG-Signed Commits
### L3: Health Check Endpoints Unauthenticated

---

## Remediation Priority

| Priority | Finding | Effort | Module |
|----------|---------|--------|--------|
| 1 | Remove `.env` from repo + rotate secrets | 1 hour | Module 2 |
| 2 | Change default credentials | 30 min | Module 2 |
| 3 | Add API authentication middleware | 4 hours | Module 2 |
| 4 | Fix FAISS pickle deserialization | 2 hours | Module 2 |
| 5 | Add security headers | 2 hours | Module 2 |
| 6 | Implement rate limiting | 3 hours | Module 2 |
| 7 | Add security audit logging | 4 hours | Module 2 |
| 8 | CI/CD security pipeline | 6 hours | Module 3 |
| 9 | Cloud security architecture | 8 hours | Module 4 |
| 10 | Documentation + runbooks | 4 hours | Module 5 |

---

## Overall Security Posture

**Current Maturity Level**: OWASP SAMM Level 0 (Initial) — ad-hoc security practices with no formal governance.

**Target Maturity Level**: OWASP SAMM Level 2 (Defined) — security integrated into SDLC with automated scanning, documented controls, and incident response procedures.

**Key Strengths**:
- Parameterised SQL queries throughout (good injection prevention)
- bcrypt for password hashing
- JWT-based session management
- Service health monitoring

**Key Weaknesses**:
- No API authentication
- No security monitoring or audit logging
- Default credentials throughout
- No CI/CD security integration
