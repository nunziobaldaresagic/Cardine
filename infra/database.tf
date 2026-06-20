resource "random_password" "pg" {
  length           = 24
  special          = true
  override_special = "-_"
  min_upper        = 1
  min_lower        = 1
  min_numeric      = 1
  min_special      = 2
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-${local.base}-${local.suffix}-ne"
  location            = var.postgres_location
  resource_group_name = azurerm_resource_group.main.name
  version             = "16"

  administrator_login    = var.postgres_admin_login
  administrator_password = random_password.pg.result

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768

  # No delegated subnet: server is reached exclusively via private endpoint.
  public_network_access_enabled = false
  zone                          = "1"

  authentication {
    password_auth_enabled = true
  }

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "cardine" {
  name      = "cardine"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_private_endpoint" "postgres" {
  name                = "pe-psql-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.pe.id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-psql"
    private_connection_resource_id = azurerm_postgresql_flexible_server.main.id
    is_manual_connection           = false
    subresource_names              = ["postgresqlServer"]
  }

  private_dns_zone_group {
    name                 = "psql-dns"
    private_dns_zone_ids = [azurerm_private_dns_zone.postgres.id]
  }
}
