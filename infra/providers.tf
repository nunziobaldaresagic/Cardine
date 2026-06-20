# Authentication is taken from the active Azure CLI session (the deploy service
# principal logged in via `az login --service-principal`). No secret is stored
# in any file. subscription_id / tenant_id are pinned for determinism.
provider "azurerm" {
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id

  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

provider "random" {}
