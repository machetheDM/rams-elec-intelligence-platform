# =============================================================================
# Terraform Outputs — Rams @Elec Intelligence Platform
# =============================================================================

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.main.name
}

output "vnet_id" {
  description = "Virtual Network ID"
  value       = azurerm_virtual_network.main.id
}

output "key_vault_uri" {
  description = "Key Vault URI for application configuration"
  value       = azurerm_key_vault.main.vault_uri
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID for diagnostic settings"
  value       = azurerm_log_analytics_workspace.main.id
}

output "postgresql_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "private_subnet_id" {
  description = "Private subnet ID for App Service VNet integration"
  value       = azurerm_subnet.private.id
}

output "data_subnet_id" {
  description = "Data subnet ID for Private Endpoints"
  value       = azurerm_subnet.data.id
}
