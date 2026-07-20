# Secure Coding Implementation — Rams @Elec Platform

**Module 2 of SecureDevOps Pipeline**
**Applies**: ECCU510 Secure Programming (CASE certification)
**Date**: July 2026

---

## Overview

This document records all security hardening applied to the Rams @Elec Intelligence Platform codebase. Every change is additive (no breaking changes) and documented with reference to the relevant OWASP control.

---

## Part A: Input Validation & Injection Prevention (OWASP A03)

### Pydantic Validation Hardening

All FastAPI Pydantic models now include:

| Control | Implementation | Location |
|---------|---------------|----------|
| `extra='forbid'` | Rejects unexpected fields | All Pydantic models |
| `str_strip_whitespace=True` | Auto-trims whitespace | All Pydantic models |
| `max_length` on all strings | Prevents buffer overflow | All Field() definitions |
| Phone validation | SA format regex + prefix whitelist | `validators.py:validate_phone_sa()` |
| Area zone whitelist | 40+ valid SA zones | `validators.py:VALID_AREA_ZONES` |
| Service category enum | 6 valid categories | `validators.py:validate_service_category()` |
| Urgency enum | 4 valid levels | `validators.py:validate_urgency()` |

### SQL Injection Prevention

**Status**: ✅ Already implemented

All database queries use SQLAlchemy `text()` with parameterised queries:

```python
# Before (hypothetical — never existed in this codebase):
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

# After (current implementation — safe):
conn.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
```

This directly applies the findings from Machethe (2026) "SQL Injection and XSS Mitigation in Cloud Applications" — parameterised queries are the primary defence against SQL injection.

### XSS Prevention in Next.js

| Control | Implementation |
|---------|---------------|
| Content-Security-Policy | Added to `next.config.ts` |
| X-Frame-Options: DENY | Prevents clickjacking |
| X-Content-Type-Options: nosniff | Prevents MIME sniffing |
| DOMPurify | Recommended for any HTML rendering (not currently needed — no user HTML rendering) |

### LLM Prompt Injection Prevention

Added `sanitize_prompt_input()` in `validators.py`:
- Strips control characters
- Removes markdown code fences (injection vector)
- Filters common prompt injection patterns (`[SYSTEM]`, `ignore previous instructions`, etc.)
- Applied to all user input before LLM prompt injection

---

## Part B: Authentication Security (OWASP A07)

### JWT Hardening

| Control | Implementation |
|---------|---------------|
| Token expiry | 24h regular, 15min sensitive (configurable) |
| Token blacklisting | In-memory set (Redis in production) |
| Role-based access | `require_role()` decorator for endpoint protection |
| JWT verification | `JWTAuthMiddleware` — verifies exp, iat, signature |

### API Key Security

| Control | Implementation |
|---------|---------------|
| Key hashing | SHA-256 before storage — raw keys never stored |
| Key rotation | Environment variable-based — rotate by updating `API_KEY_HASHES` |
| Key validation | `APIKeyMiddleware` — validates on every request |
| Audit logging | All API key usage logged via `SecurityLogger` |

### Password Policy (Recommended for Portal)

| Requirement | Value |
|-------------|-------|
| Minimum length | 12 characters |
| Complexity | Uppercase + lowercase + digit + special character |
| Hashing | bcrypt with cost factor ≥ 12 |
| Account lockout | 5 failed attempts → 15-minute lockout |
| MFA | TOTP-based (recommended, not yet implemented) |

---

## Part C: Security Headers (OWASP A05)

### Next.js (`next.config.ts`)

```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
X-XSS-Protection: 0
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

### FastAPI (`SecurityHeadersMiddleware`)

Same headers applied to all 4 FastAPI services via shared middleware.

---

## Part D: Dependency Security (OWASP A06)

### Python Dependencies

- All dependencies pinned to exact versions in `security/dependencies/pinned_requirements.txt`
- `pip-audit` added to CI pipeline (Module 3)
- Safety database checked for known CVEs

### Node.js Dependencies

- `npm audit` added to CI pipeline
- `next-auth@^5.0.0-beta.25` flagged — monitoring for stable release

### Accepted Vulnerabilities

| Package | CVE | Justification |
|---------|-----|---------------|
| None yet | — | Will document any accepted risks here |

---

## Part E: Security Logging (OWASP A09)

### Structured Audit Logging

`SecurityLogger` class in `security/logging/security_logger.py`:

**Events logged**:
- `AUTH_SUCCESS` / `AUTH_FAILURE` — authentication attempts
- `AUTHZ_FAILURE` — authorisation failures (403)
- `RATE_LIMIT_HIT` — rate limit exceeded
- `VALIDATION_FAILURE` — input validation failures
- `SUSPICIOUS_PATTERN` — multiple failures from same IP
- `API_KEY_USAGE` — API key usage tracking
- `TOKEN_REVOKED` — token blacklisting events

**Output destinations**:
1. stdout (JSON format) — for SIEM ingestion via Docker logs
2. PostgreSQL `security_audit_log` table — for dashboard queries

**Log format**:
```json
{
  "timestamp": "2026-07-20T15:30:00.000Z",
  "event_type": "AUTH_FAILURE",
  "severity": "HIGH",
  "source_ip": "192.168.1.100",
  "user_id": null,
  "endpoint": "/triage/classify",
  "details": {"email": "test@example.com", "reason": "Invalid password"}
}
```

---

## Files Changed

| File | Change | OWASP |
|------|--------|-------|
| `security/input_validation/validators.py` | New — shared validators | A03 |
| `security/auth/jwt_middleware.py` | New — JWT auth middleware | A07 |
| `security/auth/api_key_middleware.py` | New — API key auth | A07 |
| `security/auth/rate_limiter.py` | New — rate limiting | A05 |
| `security/headers/security_headers.py` | New — security headers | A05 |
| `security/logging/security_logger.py` | New — audit logging | A09 |
| `security/setup.py` | New — one-line security setup | All |
| `security/dependencies/pinned_requirements.txt` | New — pinned deps | A06 |
| `frontend/next.config.ts` | Modified — security headers | A05 |
| `services/triage/main.py` | Modified — hardened | A03, A05, A07 |
| `services/dispatch/main.py` | Modified — hardened | A03, A05, A07 |

---

## References

- OWASP Top 10 2021: https://owasp.org/www-project-top-ten/
- OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
- NIST SP 800-63B (Digital Identity Guidelines): https://pages.nist.gov/800-63-3/
- Machethe, D.M. (2026). "SQL Injection and XSS Mitigation in Cloud Applications." ECCU Cyber Journal.
- CASE Certification (ECCU510): Secure Programming principles
