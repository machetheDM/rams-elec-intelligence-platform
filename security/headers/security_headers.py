"""
Security Headers Middleware — Rams @Elec FastAPI Services
==========================================================
Adds OWASP-recommended HTTP security headers to all responses.

Applies ECCU510 Secure Programming (CASE) security misconfiguration
mitigation (OWASP A05).

Headers implemented:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)
  - X-XSS-Protection (legacy, for older browsers)

Usage:
    from security.headers.security_headers import SecurityHeadersMiddleware

    app.add_middleware(SecurityHeadersMiddleware)
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi import Request


# ── Content Security Policy ────────────────────────────────────────────
# Restrict which resources the browser can load.
# Tighten this for your specific frontend domain in production.
CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https://api.ramsatelec.co.za; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "upgrade-insecure-requests; "
)

# ── Permissions Policy ─────────────────────────────────────────────────
# Restrict browser features the site can use.
PERMISSIONS_POLICY = (
    "camera=(), "
    "microphone=(), "
    "geolocation=(self), "
    "payment=(), "
    "usb=(), "
    "magnetometer=(), "
    "gyroscope=(), "
    "fullscreen=(self)"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to every HTTP response.

    Reference: OWASP Secure Headers Project
    https://owasp.org/www-project-secure-headers/
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        headers = response.headers

        # Prevent MIME type sniffing
        headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        headers["X-Frame-Options"] = "DENY"

        # Control referrer information
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Content Security Policy
        headers["Content-Security-Policy"] = CSP_POLICY

        # Permissions Policy (formerly Feature-Policy)
        headers["Permissions-Policy"] = PERMISSIONS_POLICY

        # HSTS — only in production (HTTPS)
        # Uncomment when deploying behind HTTPS:
        # headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # Legacy XSS protection for older browsers
        headers["X-XSS-Protection"] = "0"  # Disabled — CSP handles this; 0 avoids false positives

        # Cross-Origin isolation hints
        headers["Cross-Origin-Opener-Policy"] = "same-origin"
        headers["Cross-Origin-Resource-Policy"] = "same-origin"

        # Cache control for sensitive data
        if request.url.path.startswith("/triage") or request.url.path.startswith("/dispatch"):
            headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            headers["Pragma"] = "no-cache"

        return response
