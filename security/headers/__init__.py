# =============================================================================
# HTTP Security Headers — OWASP A05 (Security Misconfiguration)
# =============================================================================
#
# Why this matters:
#   Security Misconfiguration is the #5 risk in OWASP Top 10 2021.
#   Missing security headers allow clickjacking, MIME sniffing, XSS,
#   and information leakage through referrer headers.
#
# What this module provides:
#   - Content-Security-Policy (restricts script/style sources)
#   - X-Frame-Options: DENY (prevents clickjacking)
#   - X-Content-Type-Options: nosniff (prevents MIME sniffing)
#   - Referrer-Policy: strict-origin-when-cross-origin
#   - Permissions-Policy (restricts browser features)
#   - Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy
#   - Cache-Control for sensitive endpoints
#
# How to use:
#   from security.headers.security_headers import SecurityHeadersMiddleware
#   app.add_middleware(SecurityHeadersMiddleware)
#
# Key design decisions:
#   - CSP uses 'unsafe-inline' for scripts: Next.js requires this for
#     client-side hydration. Mitigated by strict script-src whitelist.
#   - X-XSS-Protection set to '0': CSP handles XSS; this header can
#     cause false positives in modern browsers.
#   - HSTS commented out: only enable behind HTTPS (production).
#   - Cache-Control on sensitive paths: prevents browser caching of
#     triage/dispatch responses containing customer data.
#
# References:
#   OWASP Secure Headers Project:
#     https://owasp.org/www-project-secure-headers/
#   MDN Web Docs — HTTP Security Headers:
#     https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security
# ============================================================================="
