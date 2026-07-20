# OWASP Top 10 2021 Assessment — Rams @Elec Intelligence Platform

**Assessed by**: Dingaan Mahlatse Machethe  
**Date**: July 2026  
**Context**: ECCU510 Secure Programming (CASE) + ECCU524 Cloud Security (CCSE)  
**Disclaimer**: This is an academic security assessment, not a professional security audit.

---

## A01: Broken Access Control

**Risk**: Failure to enforce what authenticated users are allowed to do.

**Assessment**: ⚠️ Partial

**Evidence**:
- Next.js frontend uses NextAuth v5 with JWT callbacks (`auth.config.ts:14-29`) — role-based claims are set in the token
- FastAPI services have **NO authentication middleware** — all endpoints are publicly accessible:
  - `POST /triage/classify` — no auth required
  - `POST /triage/estimate-cost` — no auth required
  - `POST /dispatch/recommend` — no auth required
  - `POST /dispatch/assign` — no auth required, anyone can assign technicians
  - `POST /chatbot/query` — no auth required
  - `POST /loadshedding/subscribe` — no auth required
- No role-based access control on API endpoints
- No API key validation for service-to-service communication

**Recommendation**:
1. Add JWT verification middleware to all FastAPI services
2. Implement role-based guards: only admin/technician roles can access `/dispatch/assign`
3. Add API key authentication for service-to-service calls
4. Implement proper CORS origins (currently `allow_origins=["*"]`)

---

## A02: Cryptographic Failures

**Risk**: Sensitive data exposed due to weak or missing cryptography.

**Assessment**: ⚠️ Partial

**Evidence**:
- Password hashing uses bcrypt via `bcryptjs` (`auth.config.ts:3,51`) — ✅ good choice
- **No cost factor explicitly configured** — bcryptjs defaults to 10; should be ≥12
- Database connection strings contain plaintext credentials in `docker-compose.yml`:
  ```yaml
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  ```
- API keys (GROQ_API_KEY, ESKOM_SE_PUSH_API_KEY) stored in `.env` — no secrets manager
- No TLS/HTTPS enforcement in docker-compose — all services communicate over HTTP
- No certificate pinning or management

**Recommendation**:
1. Set bcrypt cost factor to 12: `compare(password, user.passwordHash)` → verify cost factor at hash time
2. Move all secrets to a secrets manager (Azure Key Vault or `.env` + strict `.gitignore`)
3. Enforce HTTPS in production with TLS 1.3
4. Rotate default PostgreSQL credentials immediately

---

## A03: Injection

**Risk**: Untrusted data sent to interpreters (SQL, XSS, OS commands).

**Assessment**: ⚠️ Partial — directly relates to published ECCU research

**Evidence**:
- **SQL**: All database queries use SQLAlchemy `text()` with parameterised queries:
  ```python
  conn.execute(text("SELECT id FROM technicians WHERE id = :tid"), {"tid": request.technician_id})
  ```
  This is ✅ **parameterised** — safe against SQL injection.
- **XSS in Next.js**: No Content Security Policy configured. User input rendered without visible sanitisation.
- **LLM prompt injection**: The triage service injects raw user messages into LLM prompts:
  ```python
  CLASSIFICATION_PROMPT.format(message=inquiry.raw_message)
  ```
  No input sanitisation before prompt injection — vulnerable to prompt injection attacks.
- **JSON parsing**: `json.loads(content)` on LLM output — if LLM is compromised, could inject arbitrary JSON.

**Recommendation**:
1. Add CSP headers in `next.config.js`
2. Sanitise user input before LLM prompt injection (strip control characters, limit length)
3. Validate LLM JSON output against Pydantic schema before returning
4. Document: this directly applies findings from the author's published paper on SQL injection and XSS in cloud applications (Machethe, 2026)

---

## A04: Insecure Design

**Risk**: Missing or ineffective security controls due to design flaws.

**Assessment**: ❌ Missing

**Evidence**:
- No threat model documented before development
- No security design review process
- No data flow diagrams with trust boundaries
- No "security by design" documentation
- No risk assessment for third-party integrations (Groq, EskomSePush)
- FAISS vectorstore loaded with `allow_dangerous_deserialization=True` — pickle-based deserialization is inherently unsafe

**Recommendation**:
1. Create and maintain a threat model (see `reports/threat_model.md`)
2. Document data flows with trust boundaries
3. Replace FAISS pickle deserialization with safe serialization format (JSON-based index)
4. Implement design review checklist for all new features

---

## A05: Security Misconfiguration

**Risk**: Insecure default configurations, incomplete settings, verbose errors.

**Assessment**: ❌ Missing

**Evidence**:
- **CORS**: `allow_origins=["*"]` in all 4 FastAPI services — allows any origin to call APIs
- **No security headers**: Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Debug information leakage**: `logger.error(f"Dispatch query failed: {e}")` — error messages may leak stack traces
- **Default credentials**: PostgreSQL `postgres:postgres`, n8n `admin:password`
- **Docker health checks expose internal endpoints**: `curl -f http://localhost:8001/triage/health` — health endpoints are unauthenticated
- **No rate limiting** on any endpoint — vulnerable to brute force and DoS
- **`.env` file** present in repository (1396 bytes) — should be `.env.example` only

**Recommendation**:
1. Restrict CORS to known frontend origins
2. Add security headers middleware to all services
3. Change all default credentials
4. Implement rate limiting (e.g., 100 req/min per IP)
5. Remove `.env` from repository, keep only `.env.example`
6. Add `secure` headers to health check responses

---

## A06: Vulnerable and Outdated Components

**Risk**: Using components with known vulnerabilities.

**Assessment**: ⚠️ Partial

**Evidence**:
- `next@^15.1.0` — Next.js 15.x, relatively current (as of 2026)
- `next-auth@^5.0.0-beta.25` — **BETA VERSION** — using beta authentication library in production is risky
- `bcryptjs@^2.4.3` — current stable
- Python dependencies not pinned to exact versions in service `requirements.txt` files
- No automated dependency vulnerability scanning (no Dependabot, no Safety, no npm audit in CI)
- Docker base images: `postgres:15-alpine`, `redis:7-alpine`, `n8nio/n8n:latest` — `latest` tag is dangerous (unpinned)

**Recommendation**:
1. Pin all Python dependencies to exact versions (`==` not `>=`)
2. Upgrade `next-auth` to stable release when available
3. Add Dependabot or Renovate for automated dependency updates
4. Add `pip-audit` and `npm audit` to CI pipeline
5. Pin Docker image tags to specific versions (never use `:latest`)

---

## A07: Identification and Authentication Failures

**Risk**: Weak or missing authentication mechanisms.

**Assessment**: ⚠️ Partial

**Evidence**:
- NextAuth v5 with credentials provider — ✅ basic auth implemented
- JWT used for session management — ✅
- **No MFA support** — single-factor authentication only
- **No account lockout** after failed attempts — vulnerable to credential stuffing
- **No password policy enforcement** — no minimum length, complexity, or expiry
- **No session timeout** configured — JWTs appear to have no explicit expiry
- **FastAPI services have NO authentication** — completely open
- **n8n uses basic auth** with default credentials — weak

**Recommendation**:
1. Implement account lockout after 5 failed attempts
2. Enforce password policy: minimum 12 characters, complexity requirements
3. Add JWT token expiry: 24h for regular sessions, 15min for sensitive operations
4. Add authentication middleware to all FastAPI services
5. Change n8n default credentials
6. Implement token rotation on refresh

---

## A08: Software and Data Integrity Failures

**Risk**: Code and data integrity not verified.

**Assessment**: ❌ Missing

**Evidence**:
- No CI/CD integrity checks — no signature verification on dependencies
- No checksum verification on downloaded models (XGBoost pickle file)
- FAISS index loaded via pickle (`allow_dangerous_deserialization=True`) — no integrity verification
- No Subresource Integrity (SRI) on CDN-loaded assets
- Docker images built without content trust / image signing
- No GPG-signed commits required

**Recommendation**:
1. Enable Docker Content Trust (`DOCKER_CONTENT_TRUST=1`)
2. Verify checksums on downloaded model files
3. Replace pickle-based FAISS loading with safe format
4. Configure npm to verify package integrity (`npm ci` instead of `npm install`)
5. Enable branch protection rules on GitHub

---

## A09: Security Logging and Monitoring Failures

**Risk**: Insufficient logging to detect and respond to breaches.

**Assessment**: ❌ Missing

**Evidence**:
- Only basic `logging.info/error` in Python services — no structured logging
- No security audit log — authentication attempts, access denials, rate limit hits not logged
- Chatbot logs conversations but not as security events
- No centralized log aggregation (no ELK, Loki, or Sentinel)
- No alerting on suspicious patterns (multiple failed logins, unusual API calls)
- No log retention policy
- Health check endpoints don't log access

**Recommendation**:
1. Implement structured JSON security audit logging
2. Log all authentication events (success + failure)
3. Log all authorisation failures (403 responses)
4. Implement centralized log aggregation
5. Create alert rules for suspicious patterns
6. Define log retention policy (minimum 90 days for security logs)

---

## A10: Server-Side Request Forgery (SSRF)

**Risk**: Server fetches attacker-controlled URLs.

**Assessment**: ⚠️ Partial

**Evidence**:
- Loadshedding service makes outbound HTTP calls to EskomSePush API:
  ```python
  resp = self.client.get(f"/area?id={area_id}")
  ```
  The `area_id` comes from user input (`area_zone` path parameter) — if an attacker can control the area_id mapping, they could potentially redirect requests.
- Chatbot service calls Groq API — URL is hardcoded (safe)
- No URL validation or allowlisting for external API calls
- No network egress filtering in Docker Compose

**Recommendation**:
1. Implement URL allowlisting for all external API calls
2. Validate and sanitise all user-supplied parameters used in outbound requests
3. Use network segmentation to restrict egress from application containers
4. Add request timeouts on all external HTTP calls (already partially done: `timeout=15.0`)

---

## Summary

| OWASP Category | Status | Criticality |
|---------------|--------|-------------|
| A01: Broken Access Control | ⚠️ Partial | **HIGH** |
| A02: Cryptographic Failures | ⚠️ Partial | **HIGH** |
| A03: Injection | ⚠️ Partial | **MEDIUM** |
| A04: Insecure Design | ❌ Missing | **MEDIUM** |
| A05: Security Misconfiguration | ❌ Missing | **CRITICAL** |
| A06: Vulnerable Components | ⚠️ Partial | **MEDIUM** |
| A07: Authentication Failures | ⚠️ Partial | **HIGH** |
| A08: Data Integrity Failures | ❌ Missing | **MEDIUM** |
| A09: Logging & Monitoring | ❌ Missing | **HIGH** |
| A10: SSRF | ⚠️ Partial | **LOW** |

**Overall Security Posture**: The Rams @Elec platform has foundational security gaps typical of early-stage applications. Critical issues in security misconfiguration (CORS, default credentials, no headers) and missing access control on API services require immediate attention. The platform has good SQL injection prevention (parameterised queries) but needs comprehensive security hardening across all OWASP categories.
