# =============================================================================
# Input Validation & Injection Prevention — OWASP A03
# =============================================================================
#
# Why this matters:
#   Injection is the #3 risk in OWASP Top 10 2021. Untrusted input reaches
#   interpreters (SQL, LLM prompts, HTML) and causes data breaches.
#
# What this module provides:
#   - SA phone number validation (E.164 normalisation)
#   - Area zone whitelist (40+ valid SA locations)
#   - Service category and urgency enum validation
#   - LLM prompt injection sanitisation (strips control chars, code fences)
#   - General text sanitisation (null bytes, truncation)
#
# How to use:
#   from security.input_validation.validators import (
#       validate_phone_sa, validate_area_zone, sanitize_prompt_input
#   )
#
# Key design decisions:
#   - Whitelist over blacklist: only allow known-good values
#   - Fail closed: reject unknown input rather than passing it through
#   - Normalise: return canonical forms (e.g., +27XXXXXXXXX for phones)
#   - Defence in depth: sanitise at the boundary, validate at the model
#
# References:
#   OWASP Input Validation Cheat Sheet:
#     https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
#   Machethe, D.M. (2026). "SQL Injection and XSS Mitigation in Cloud Applications."
#     ECCU Cyber Journal.
# ============================================================================="
