"""
API Key Authentication Middleware — Rams @Elec FastAPI Services
================================================================
Validates API keys for service-to-service communication.

API keys are hashed (SHA-256) before storage. The middleware
compares the hash of the provided key against stored hashes.

Usage:
    from security.auth.api_key_middleware import APIKeyMiddleware

    app.add_middleware(APIKeyMiddleware)
"""

import os
import hashlib
import logging
from typing import Optional

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("security.api_key")

# ── Pre-configured API key hashes ──────────────────────────────────────
# In production, these would be stored in a database or secrets manager.
# Keys are hashed with SHA-256 — the raw key is NEVER stored.
#
# To generate a hash for a new key:
#   python -c "import hashlib; print(hashlib.sha256(b'your-api-key').hexdigest())"
#
# Default keys (CHANGE THESE IN PRODUCTION):
#   - Frontend → Services:  rams-elec-frontend-2026
#   - Airflow → Services:    rams-elec-airflow-2026
#   - n8n → Services:        rams-elec-n8n-2026

def _hash_key(key: str) -> str:
    """Hash an API key with SHA-256."""
    return hashlib.sha256(key.encode()).hexdigest()

# Load API key hashes from environment or use defaults
# Format: comma-separated list of SHA-256 hashes
API_KEY_HASHES_RAW = os.getenv(
    "API_KEY_HASHES",
    ",".join([
        _hash_key("rams-elec-frontend-2026"),
        _hash_key("rams-elec-airflow-2026"),
        _hash_key("rams-elec-n8n-2026"),
    ])
)
VALID_API_KEY_HASHES: set[str] = set(
    h.strip() for h in API_KEY_HASHES_RAW.split(",") if h.strip()
)

# Public endpoints that don't require API key
PUBLIC_ENDPOINTS = {
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
}


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Validate API keys on incoming requests.

    Looks for the API key in:
      1. X-API-Key header (preferred)
      2. Authorization: Bearer <key> header
      3. api_key query parameter (least secure — only for dev)

    Skips validation for public endpoints and OPTIONS requests.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip for public endpoints and CORS preflight
        if request.url.path in PUBLIC_ENDPOINTS or request.method == "OPTIONS":
            return await call_next(request)

        for prefix in ["/docs", "/openapi.json", "/redoc"]:
            if request.url.path.startswith(prefix):
                return await call_next(request)

        # Extract API key
        api_key = None

        # 1. X-API-Key header (preferred)
        api_key = request.headers.get("X-API-Key")

        # 2. Authorization: Bearer <key>
        if not api_key:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                api_key = auth_header[7:]

        # 3. Query parameter (least secure)
        if not api_key:
            api_key = request.query_params.get("api_key")

        if not api_key:
            logger.warning(f"No API key for {request.method} {request.url.path}")
            raise HTTPException(
                status_code=401,
                detail="API key required. Provide via X-API-Key header.",
            )

        # Validate key hash
        key_hash = _hash_key(api_key)
        if key_hash not in VALID_API_KEY_HASHES:
            logger.warning(f"Invalid API key for {request.method} {request.url.path}")
            raise HTTPException(
                status_code=401,
                detail="Invalid API key.",
            )

        # Attach key info to request state
        request.state.api_key_authenticated = True
        request.state.api_key_hash = key_hash[:8]  # Truncated for logging

        return await call_next(request)
