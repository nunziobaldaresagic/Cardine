# Storage for GitHub Actions deploy packages. The App Service pulls the built
# zip from here via WEBSITE_RUN_FROM_PACKAGE (set by CI), keeping the app's
# inbound surface private (no SCM/Kudu push needed).
resource "azurerm_storage_account" "deploy" {
  name                            = "sa${var.prefix}${local.suffix}"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  tags                            = var.tags
}

resource "azurerm_storage_container" "deploy" {
  name                  = "deploy"
  storage_account_id    = azurerm_storage_account.deploy.id
  container_access_type = "private"
}
