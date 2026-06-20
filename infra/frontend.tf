# React frontend hosting. Static Web Apps brings its own CDN and TLS; it sits
# alongside the WAF (not behind it), matching the proposal architecture.
resource "azurerm_static_web_app" "main" {
  name                = "stapp-${local.base}"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku_tier            = "Standard"
  sku_size            = "Standard"
  tags                = var.tags
}
