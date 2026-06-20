data "azurerm_client_config" "current" {}

# Globally-unique suffix for resources that need it (web app, postgres, kv, oai).
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  base   = "${var.prefix}-${var.environment}"
  suffix = random_string.suffix.result
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}
