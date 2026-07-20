# =============================================================================
# Dependency Security — OWASP A06 (Vulnerable and Outdated Components)
# =============================================================================
#
# Why this matters:
#   Using components with known vulnerabilities is the #6 risk in OWASP Top 10.
#   A single vulnerable dependency can compromise the entire platform.
#   Example: Log4Shell (CVE-2021-44228) — CVSS 10.0, affected millions of apps.
#
# What this module provides:
#   - Pinned dependency versions (exact == not >=)
#   - pip-audit integration for CVE scanning
#   - Safety database checking
#   - npm audit for Node.js dependencies
#
# How to use:
#   1. Install pinned deps: pip install -r security/dependencies/pinned_requirements.txt
#   2. Audit for CVEs: pip-audit -r security/dependencies/pinned_requirements.txt
#   3. Update when CVEs found: pip install package==fixed.version
#   4. Re-pin and commit
#
# Key design decisions:
#   - Exact versions (==): reproducible builds, no surprise updates
#   - Separate file from service requirements: single source of truth
#   - Documented update process: clear workflow for security patches
#   - Accepted risk documentation: track CVEs we've reviewed and accepted
#
# References:
#   OWASP Dependency-Check:
#     https://owasp.org/www-project-dependency-check/
#   GitHub Advisory Database:
#     https://github.com/advisories
# ============================================================================="
