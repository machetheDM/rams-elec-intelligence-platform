"""
Security Setup — Apply all security middleware to a FastAPI app
================================================================
Single import to harden any FastAPI service.

Usage:
    from security.setup import apply_security_middleware

    app = FastAPI()
    apply_security_middleware(app, enable_auth=True, cors_origins=["https://ramsatelec.co.za"])
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from security.headers.security_headers import SecurityHeadersMiddleware
from security.auth.rate_limiter import RateLimiterMiddleware
from security.auth.jwt_middleware import JWTAuthMiddleware
from security.auth.api_key_middleware import APIKeyMiddleware


def apply_security_middleware(
    app: FastAPI,
    enable_auth: bool = False,
    enable_api_key: bool = False,
    cors_origins: list[str] | None = None,
    rate_limit: int = 100,
    rate_window: int = 60,
) -> None:
    """Apply all security middleware to a FastAPI application."""
    if cors_origins is None:
        cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Remove existing CORS middleware (replace wildcard)
    app.user_middleware = [
        m for m in app.user_middleware
        if m.cls != CORSMiddleware
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-API-Key"],
    )

    # Security headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Rate limiting
    app.add_middleware(RateLimiterMiddleware, max_requests=rate_limit, window_seconds=rate_window)

    # API key auth (for service-to-service calls)
    if enable_api_key:
        app.add_middleware(APIKeyMiddleware)

    # JWT auth (for user-facing endpoints)
    if enable_auth:
        app.add_middleware(JWTAuthMiddleware)
