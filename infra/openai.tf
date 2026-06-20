# Azure OpenAI is coded for architectural fidelity but disabled by default
# (var.deploy_openai = false). Enabling it requires approved GPT-4o quota in the
# subscription; the app mocks the LLM regardless for the demo.

resource "azurerm_cognitive_account" "openai" {
  count = var.deploy_openai ? 1 : 0

  name                  = "oai-${local.base}-${local.suffix}"
  location              = azurerm_resource_group.main.location
  resource_group_name   = azurerm_resource_group.main.name
  kind                  = "OpenAI"
  sku_name              = "S0"
  custom_subdomain_name = "oai-${local.base}-${local.suffix}"

  public_network_access_enabled = false
  tags                          = var.tags
}

resource "azurerm_private_dns_zone" "openai" {
  count = var.deploy_openai ? 1 : 0

  name                = "privatelink.openai.azure.com"
  resource_group_name = azurerm_resource_group.main.name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "openai" {
  count = var.deploy_openai ? 1 : 0

  name                  = "link-openai"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.openai[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false
  tags                  = var.tags
}

resource "azurerm_private_endpoint" "openai" {
  count = var.deploy_openai ? 1 : 0

  name                = "pe-oai-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.pe.id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-oai"
    private_connection_resource_id = azurerm_cognitive_account.openai[0].id
    is_manual_connection           = false
    subresource_names              = ["account"]
  }

  private_dns_zone_group {
    name                 = "oai-dns"
    private_dns_zone_ids = [azurerm_private_dns_zone.openai[0].id]
  }
}
