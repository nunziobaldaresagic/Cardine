output "resource_group" {
  value = azurerm_resource_group.main.name
}

output "appgw_public_ip" {
  description = "Public IP of the Application Gateway (entry point)."
  value       = azurerm_public_ip.appgw.ip_address
}

output "app_entrypoint_url" {
  description = "Demo entry point: Internet -> WAF -> App Service."
  value       = "http://${azurerm_public_ip.appgw.ip_address}"
}

output "api_url" {
  description = "Backend API entry point: HTTPS via App Gateway WAF on the custom domain."
  value       = "https://${var.api_custom_domain}"
}

output "app_service_name" {
  value = azurerm_linux_web_app.main.name
}

output "app_service_hostname" {
  value = azurerm_linux_web_app.main.default_hostname
}

output "static_web_app_url" {
  value = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "static_web_app_api_key" {
  description = "Deployment token for the Static Web App (frontend CI/CD)."
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "deploy_storage_account" {
  description = "Storage account CI uploads the deploy package to."
  value       = azurerm_storage_account.deploy.name
}

output "deploy_container" {
  value = azurerm_storage_container.deploy.name
}
