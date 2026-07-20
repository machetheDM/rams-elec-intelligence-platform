# =============================================================================
# Rams @Elec — Security Hardening Package
# =============================================================================
#
# This package contains all security hardening modules applied to the
# Rams @Elec Intelligence Platform as part of the SecureDevOps Pipeline.
#
# Academic Context:
#   ECCU510: Secure Programming (CASE certification)
#   ECCU524: Designing and Implementing Cloud Security (CCSE certification)
#   MSc Cybersecurity, Cloud Security Architecture — EC-Council University
#   Term 3, July 2026
#   Student: Dingaan Mahlatse Machethe
#
# Package Structure:
#   security/
#   ├── setup.py              — One-line security middleware for any FastAPI app
#   ├── input_validation/      — Pydantic validators (OWASP A03: Injection)
#   │   └── validators.py      — SA phone, area zones, prompt sanitisation
#   ├── auth/                  — Authentication & authorisation (OWASP A07)
#   │   ├── jwt_middleware.py  — JWT verification + RBAC decorator
#   │   ├── api_key_middleware.py — API key hashing + validation
#   │   └── rate_limiter.py    — In-memory sliding window rate limiter
#   ├── headers/               — HTTP security headers (OWASP A05)
#   │   └── security_headers.py — CSP, HSTS, X-Frame-Options, etc.
#   ├── logging/               — Audit logging (OWASP A09)
#   │   └── security_logger.py — Structured JSON logger + DB persistence
#   └── dependencies/          — Dependency security (OWASP A06)
#       └── pinned_requirements.txt — Exact version pins for all Python deps
#
# How to use:
#   from security.setup import apply_security_middleware
#   apply_security_middleware(app, enable_api_key=True)
#
# References:
#   OWASP Top 10 2021: https://owasp.org/www-project-top-ten/
#   NIST SP 800-53 Rev 5: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
# =============================================================================
