"""
Shared Pydantic Validators — Rams @Elec Security Hardening
===========================================================
Applies ECCU510 Secure Programming (CASE) input validation principles.

All FastAPI endpoints must use these validators to prevent:
  - Injection attacks (SQL, XSS, prompt injection)
  - Business logic abuse (invalid phone numbers, out-of-range values)
  - Data corruption (overly long strings, unexpected fields)

Usage:
    from security.input_validation.validators import (
        validate_phone_sa, validate_area_zone, sanitize_text
    )

    class InquiryInput(BaseModel):
        model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
        raw_message: str = Field(..., max_length=2000)
        customer_phone: Optional[str] = Field(None, pattern=r'^\+27[0-9]{9}$')

    @field_validator('customer_phone')
    @classmethod
    def phone_must_be_sa(cls, v):
        return validate_phone_sa(v)
"""

import re
from typing import Optional

# ── SA Phone Number Validation ─────────────────────────────────────────
# South African mobile numbers: +27 XX XXX XXXX or 0XX XXX XXXX
SA_PHONE_REGEX = re.compile(
    r"^(?:\+27|0)([6-8][0-9])([0-9]{3})([0-9]{4})$"
)

# Known SA mobile prefixes
SA_MOBILE_PREFIXES = {
    "60", "61", "62", "63", "64", "65",  # MTN
    "71", "72", "73", "74", "75", "76",  # Vodacom
    "78", "79",                          # Vodacom
    "81", "82", "83", "84",              # Telkom/8ta
    "66", "67",                          # Cell C
}

# ── SA Area Zones (Whitelist) ──────────────────────────────────────────
VALID_AREA_ZONES = {
    # Gauteng
    "Sandton", "Midrand", "Centurion", "Pretoria East", "Soweto",
    "Randburg", "Roodepoort", "Alberton", "Boksburg", "Benoni",
    "Kempton Park", "Edenvale", "Fourways", "Rosebank",
    # Limpopo
    "Polokwane", "Mokopane", "Bela-Bela", "Tzaneen", "Phalaborwa",
    "Louis Trichardt", "Thohoyandou", "Musina", "Lephalale",
    # Mpumalanga
    "Nelspruit", "Mbombela", "Witbank", "eMalahleni", "Secunda",
    # North West
    "Rustenburg", "Brits", "Klerksdorp", "Potchefstroom",
    # Free State
    "Bloemfontein", "Welkom", "Bethlehem",
    # KwaZulu-Natal
    "Durban", "Pietermaritzburg", "Richards Bay", "Newcastle",
    # Western Cape
    "Cape Town", "Stellenbosch", "Paarl", "George",
    # Eastern Cape
    "Gqeberha", "Port Elizabeth", "East London", "Mthatha",
    # Northern Cape
    "Kimberley", "Upington",
}

# ── Service Categories (Enum) ──────────────────────────────────────────
VALID_SERVICE_CATEGORIES = {
    "electrical", "refrigeration", "emergency",
    "maintenance", "installation", "general",
}

VALID_URGENCY_LEVELS = {"low", "medium", "high", "emergency"}

# ── Maximum field lengths ──────────────────────────────────────────────
MAX_MESSAGE_LENGTH = 2000
MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 254  # RFC 5321
MAX_PHONE_LENGTH = 15


def validate_phone_sa(phone: Optional[str]) -> Optional[str]:
    """
    Validate a South African phone number.

    Accepts formats:
      - +27 71 101 8493
      - 071 101 8493
      - +27711018493
      - 0711018493

    Returns the normalised E.164 format (+27XXXXXXXXX) or raises ValueError.
    """
    if phone is None:
        return None

    # Strip whitespace and common separators
    cleaned = re.sub(r"[\s\-\(\)\.]", "", phone.strip())

    match = SA_PHONE_REGEX.match(cleaned)
    if not match:
        raise ValueError(
            f"Invalid SA phone number: '{phone}'. "
            f"Expected format: +27 XX XXX XXXX or 0XX XXX XXXX"
        )

    prefix = match.group(1)
    if prefix not in SA_MOBILE_PREFIXES:
        raise ValueError(
            f"Phone prefix '{prefix}' is not a recognised SA mobile prefix. "
            f"Expected one of: {sorted(SA_MOBILE_PREFIXES)}"
        )

    # Normalise to E.164 format
    return f"+27{match.group(1)}{match.group(2)}{match.group(3)}"


def validate_area_zone(zone: Optional[str]) -> Optional[str]:
    """
    Validate that the area zone is a recognised SA location.
    Case-insensitive matching.
    """
    if zone is None:
        return None

    # Case-insensitive lookup
    zone_title = zone.strip().title()
    for valid_zone in VALID_AREA_ZONES:
        if valid_zone.lower() == zone.strip().lower():
            return valid_zone

    raise ValueError(
        f"Unknown area zone: '{zone}'. "
        f"Must be one of: {sorted(VALID_AREA_ZONES)}"
    )


def validate_service_category(category: str) -> str:
    """Validate service category against whitelist."""
    cat_lower = category.strip().lower()
    if cat_lower not in VALID_SERVICE_CATEGORIES:
        raise ValueError(
            f"Invalid service category: '{category}'. "
            f"Must be one of: {sorted(VALID_SERVICE_CATEGORIES)}"
        )
    return cat_lower


def validate_urgency(urgency: str) -> str:
    """Validate urgency level against whitelist."""
    urg_lower = urgency.strip().lower()
    if urg_lower not in VALID_URGENCY_LEVELS:
        raise ValueError(
            f"Invalid urgency: '{urgency}'. "
            f"Must be one of: {sorted(VALID_URGENCY_LEVELS)}"
        )
    return urg_lower


def sanitize_text(text: str, max_length: int = MAX_MESSAGE_LENGTH) -> str:
    """
    Sanitize free-text input to prevent prompt injection and XSS.

    - Strips control characters (except newlines and tabs)
    - Truncates to max_length
    - Removes null bytes
    """
    if not isinstance(text, str):
        return ""

    # Remove null bytes
    text = text.replace("\0", "")

    # Remove control characters except \n and \t
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Truncate
    if len(text) > max_length:
        text = text[:max_length]

    return text.strip()


def sanitize_prompt_input(text: str) -> str:
    """
    Sanitize user input before injecting into LLM prompts.

    Additional protections beyond sanitize_text:
    - Strips markdown code blocks that could inject system instructions
    - Removes common prompt injection patterns
    """
    text = sanitize_text(text, max_length=MAX_MESSAGE_LENGTH)

    # Strip markdown code fences that could contain injection payloads
    text = re.sub(r"```[\s\S]*?```", "[CODE_BLOCK_REMOVED]", text)

    # Remove common prompt injection delimiters
    injection_patterns = [
        r"\[SYSTEM\]", r"\[/SYSTEM\]",
        r"<\|im_start\|>", r"<\|im_end\|>",
        r"\[INST\]", r"\[/INST\]",
        r"ignore (all )?previous instructions",
        r"you are now",
        r"new system prompt",
    ]
    for pattern in injection_patterns:
        text = re.sub(pattern, "[FILTERED]", text, flags=re.IGNORECASE)

    return text
