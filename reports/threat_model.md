# STRIDE Threat Model — Rams @Elec Intelligence Platform

**Methodology**: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
**Scope**: All 4 FastAPI services, Next.js frontend, Streamlit, Airflow, n8n, PostgreSQL, Redis
**Date**: July 2026
**Context**: ECCU510 Secure Programming (CASE) + ECCU524 Cloud Security (CCSE)

---

## S — Spoofing

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| Impersonate customer via credential theft | High | High | NextAuth JWT sessions | MFA, account lockout, password policy (min 12 chars) |
| Impersonate technician to access dispatch | High | High | None — FastAPI has no auth | JWT verification middleware on all services |
| Spoof service-to-service calls | Medium | Medium | None | API key auth or mTLS between services |
| MITM on EskomSePush API calls | Low | Medium | HTTPS | Certificate pinning |

## T — Tampering

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| Modify job assignments via `/dispatch/assign` | High | High | None | Auth + RBAC on all mutation endpoints |
| Inject malicious data via inquiry form (XSS) | Medium | Medium | Pydantic validation (basic) | CSP headers, input sanitisation, output encoding |
| Tamper with FAISS knowledge base | Low | Medium | File permissions | Integrity checks, read-only mount |
| Tamper with XGBoost model file | Low | Low | File permissions | Checksum verification on model load |

## R — Repudiation

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| Customer denies submitting inquiry | Medium | Low | None | Audit log with timestamp, IP, user ID |
| Technician denies accepting job | Medium | Medium | `job_status_history` table | Digital signature on status changes |
| Admin denies config changes | Low | High | None | Comprehensive admin audit trail |

## I — Information Disclosure

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| DB credentials in docker-compose.yml | High | Critical | `.env` file (defaults hardcoded) | Secrets manager, remove defaults |
| API keys leaked via error messages | Medium | High | Keys from env vars | Sanitise errors, never log credentials |
| Customer PII via unauthenticated API | High | High | None | Auth on all data-access endpoints |
| `.env` file in repository | Critical | Critical | `.gitignore` | Remove from git history |
| Stack traces in API error responses | Medium | Low | logger.error() | Custom error handlers |

## D — Denial of Service

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| API overwhelmed (no rate limiting) | High | High | None | Rate limiting per IP/API key |
| DB connection pool exhaustion | Medium | High | SQLAlchemy defaults | Configure pool size + timeouts |
| Groq API rate limit exhaustion | Medium | Medium | Fallback to keyword classifier | Circuit breaker pattern |
| Docker resource exhaustion | Medium | Medium | None | CPU/memory limits in compose |

## E — Elevation of Privilege

| Threat | Likelihood | Impact | Current Mitigations | Recommended |
|--------|-----------|--------|---------------------|-------------|
| Customer accesses admin endpoints | High | Critical | None on FastAPI | RBAC middleware on all services |
| Horizontal privilege escalation (customer A sees customer B data) | Medium | High | None | Row-level security, ownership checks |
| n8n default admin credentials | High | Critical | Basic auth with defaults | Change credentials, add IP restriction |
| FAISS pickle deserialization RCE | Medium | Critical | None | Replace pickle with safe format |

---

## Risk Matrix Summary

| Risk Level | Count | Key Items |
|-----------|-------|-----------|
| **Critical** | 5 | `.env` exposure, DB credentials, n8n defaults, no API auth, pickle RCE |
| **High** | 12 | No rate limiting, no security headers, CORS wildcard, missing MFA, PII exposure |
| **Medium** | 8 | LLM prompt injection, dependency pinning, audit logging gaps |
| **Low** | 3 | MITM risk, model tampering, health endpoint exposure |
