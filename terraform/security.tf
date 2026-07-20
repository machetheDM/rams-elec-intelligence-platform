# =============================================================================
# Security Configuration — Rams @Elec Intelligence Platform
# =============================================================================
# WAF policy, Defender for Cloud, Sentinel connection
# =============================================================================

# ── WAF Policy ─────────────────────────────────────────────────────────

resource "azurerm_web_application_firewall_policy" "main" {
  name                = "rams-elec-waf-policy"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  policy_settings {
    enabled                     = true
    mode                        = "Prevention"
    request_body_check          = true
    file_upload_limit_in_mb     = 10
    max_request_body_size_in_kb = 128
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"
    }
  }

  custom_rules {
    name      = "RateLimitTriage"
    priority  = 10
    rule_type = "RateLimitRule"
    rate_limit_duration_in_min = 1
    rate_limit_threshold       = 100

    match_conditions {
      match_variables {
        variable_name = "RequestUri"
      }
      operator          = "Contains"
      negation_condition = false
      match_values      = ["/triage/classify"]
    }

    action = "Block"
  }

  custom_rules {
    name      = "GeoFilterZA"
    priority  = 20
    rule_type = "MatchRule"

    match_conditions {
      match_variables {
        variable_name = "RemoteAddr"
      }
      operator          = "GeoMatch"
      negation_condition = false
      match_values      = ["ZA"]
    }

    action = "Allow"
  }

  tags = {
    Environment = var.environment
  }
}

# ── Defender for Cloud ─────────────────────────────────────────────────

resource "azurerm_security_center_subscription_pricing" "main" {
  tier          = "Standard"
  resource_type = "VirtualMachines"
}

resource "azurerm_security_center_subscription_pricing" "containers" {
  tier          = "Standard"
  resource_type = "Containers"
}

resource "azurerm_security_center_subscription_pricing" "app_services" {
  tier          = "Standard"
  resource_type = "AppServices"
}

resource "azurerm_security_center_subscription_pricing" "sql_servers" {
  tier          = "Standard"
  resource_type = "SqlServers"
}

resource "azurerm_security_center_setting" "sentinel" {
  setting_name = "SENTINEL"
  enabled      = true
}

# ── Diagnostic Settings ────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "key_vault" {
  name                       = "keyvault-diagnostics"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "AuditEvent"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 90
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 90
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "postgresql" {
  name                       = "postgresql-diagnostics"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  log {
    category = "PostgreSQLLogs"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 90
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 90
    }
  }
}
