resource "azurerm_service_plan" "main" {
  name                = "asp-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "P2v3"
  tags                = var.tags
}

resource "azurerm_linux_web_app" "main" {
  name                = "app-${local.base}-${local.suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  # Inbound only via the App Gateway -> private endpoint path.
  public_network_access_enabled = false

  # Outbound regional VNet integration (so the app reaches Postgres/KV privately).
  virtual_network_subnet_id = azurerm_subnet.appsvc.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true

    # Route all outbound traffic through the VNet so private endpoints resolve.
    vnet_route_all_enabled = true

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "LLM_MODE"                              = "mock"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "DATABASE_URL"                          = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.pg_conn.id})"
  }

  tags = var.tags
}

# Inbound private endpoint for the App Service (App Gateway backend target).
resource "azurerm_private_endpoint" "appsvc" {
  name                = "pe-app-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.pe.id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-app"
    private_connection_resource_id = azurerm_linux_web_app.main.id
    is_manual_connection           = false
    subresource_names              = ["sites"]
  }

  private_dns_zone_group {
    name                 = "app-dns"
    private_dns_zone_ids = [azurerm_private_dns_zone.appsvc.id]
  }
}
