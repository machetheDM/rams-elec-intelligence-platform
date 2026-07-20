# =============================================================================
# Security Audit Logging — OWASP A09 (Security Logging & Monitoring Failures)
# =============================================================================
#
# Why this matters:
#   Without audit logging, you cannot detect breaches, investigate incidents,
#   or demonstrate compliance. OWASP ranks this #9 — but it's a critical
#   enabler for all other security controls.
#
# What this module provides:
#   - Structured JSON logging to stdout (for Docker/SIEM ingestion)
#   - PostgreSQL persistence (for dashboard queries and compliance)
#   - 7 event types: AUTH_SUCCESS, AUTH_FAILURE, AUTHZ_FAILURE,
#     RATE_LIMIT_HIT, VALIDATION_FAILURE, SUSPICIOUS_PATTERN,
#     API_KEY_USAGE, TOKEN_REVOKED
#   - Convenience methods for common security events
#
# How to use:
#   from security.logging.security_logger import SecurityLogger
#   sec_log = SecurityLogger(engine=db_engine, service_name="triage")
#   sec_log.log_auth_failure(source_ip="1.2.3.4", email="x@y.com", reason="bad pw")
#
# Key design decisions:
#   - JSON format: machine-parseable for SIEM (Splunk, Sentinel, ELK)
#   - Dual output: stdout for real-time + DB for historical queries
#   - Idempotent table creation: safe to call on every startup
#   - Indexed on event_type + timestamp: fast dashboard queries
#   - Never logs raw passwords or full API keys
#
# References:
#   OWASP Logging Cheat Sheet:
#     https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
#   NIST SP 800-92 (Guide to Computer Security Log Management):
#     https://csrc.nist.gov/publications/detail/sp/800-92/final
# ============================================================================="
