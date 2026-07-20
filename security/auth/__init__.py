# =============================================================================
# Authentication & Authorisation Security — OWASP A07
# =============================================================================
#
# Why this matters:
#   Identification and Authentication Failures is the #7 risk in OWASP Top 10.
#   Without proper auth, anyone can access sensitive endpoints (job assignments,
#   customer data, cost estimates).
#
# What this module provides:
#   - JWT verification middleware (token expiry, signature, RBAC)
#   - API key authentication (SHA-256 hashed, never stored in plaintext)
#   - Rate limiting (sliding window per IP, 429 on exceed)
#   - Token blacklisting (logout support)
#   - Role-based access control decorator (@require_role)
#
# How to use:
#   from security.auth.jwt_middleware import JWTAuthMiddleware, require_role
#   from security.auth.api_key_middleware import APIKeyMiddleware
#   from security.auth.rate_limiter import RateLimiterMiddleware
#
# Key design decisions:
#   - JWT over sessions: stateless, works across microservices
#   - SHA-256 for API keys: one-way hash, raw key never stored
#   - In-memory rate limiter: simple for dev, Redis for production
#   - RBAC decorator: declarative, fails closed (denies by default)
#
# Production considerations:
#   - Replace in-memory token blacklist with Redis (TTL-based expiry)
#   - Replace in-memory rate limiter with Redis (distributed consistency)
#   - Use RS256 (asymmetric) instead of HS256 for multi-service JWT
#   - Store API key hashes in a database, not environment variables
#
# References:
#   OWASP Authentication Cheat Sheet:
#     https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
#   NIST SP 800-63B (Digital Identity Guidelines):
#     https://pages.nist.gov/800-63-3/sp800-63b.html
# ============================================================================="
