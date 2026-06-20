variable "subscription_id" {
  type        = string
  description = "Target subscription (Agentic)."
}

variable "tenant_id" {
  type        = string
  description = "Azure AD tenant of the deploy service principal."
}

variable "location" {
  type        = string
  description = "Azure region (EU for GDPR)."
  default     = "westeurope"
}

variable "postgres_location" {
  type        = string
  description = "Region for PostgreSQL Flexible Server. Separate from var.location because some subscriptions are offer-restricted for PG in westeurope. Reached cross-region via private endpoint. Must stay in the EU."
  default     = "northeurope"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group to create. Convention: rg-{team colour}."
  default     = "rg-yellow"
}

variable "prefix" {
  type        = string
  description = "Short name prefix for resources."
  default     = "cardine"
}

variable "environment" {
  type        = string
  description = "Environment short name."
  default     = "demo"
}

variable "deploy_openai" {
  type        = bool
  description = "Provision the Azure OpenAI account + private endpoint. Off by default; the app mocks the LLM and GPT-4o quota is not guaranteed."
  default     = false
}

variable "api_custom_domain" {
  type        = string
  description = "Custom hostname for the backend API exposed via the App Gateway HTTPS listener."
  default     = "api.cardine.azlabs.it"
}

variable "appgw_cert_pfx_path" {
  type        = string
  description = "Path to the PFX (Let's Encrypt cert) for the API custom domain, relative to the module."
  default     = "api-cardine.pfx"
}

variable "appgw_cert_password" {
  type        = string
  description = "Password protecting the PFX. Pass via TF_VAR_appgw_cert_password; never commit."
  sensitive   = true
}

variable "postgres_admin_login" {
  type        = string
  description = "PostgreSQL administrator login."
  default     = "cardineadmin"
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to all resources."
  default = {
    project   = "cardine"
    env       = "demo"
    team      = "yellow"
    managedBy = "terraform"
    lifecycle = "throwaway"
  }
}
