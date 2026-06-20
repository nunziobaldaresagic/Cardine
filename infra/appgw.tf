resource "azurerm_public_ip" "appgw" {
  name                = "pip-agw-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags
}

resource "azurerm_web_application_firewall_policy" "main" {
  name                = "wafpol-${local.base}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = var.tags

  policy_settings {
    enabled = true
    mode    = "Prevention"
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"
    }
  }
}

locals {
  appgw_name = "agw-${local.base}"
}

resource "azurerm_application_gateway" "main" {
  name                = local.appgw_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  firewall_policy_id  = azurerm_web_application_firewall_policy.main.id
  tags                = var.tags

  sku {
    name     = "WAF_v2"
    tier     = "WAF_v2"
    capacity = 1
  }

  gateway_ip_configuration {
    name      = "gw-ipconfig"
    subnet_id = azurerm_subnet.appgw.id
  }

  frontend_port {
    name = "port-80"
    port = 80
  }

  frontend_port {
    name = "port-443"
    port = 443
  }

  # Let's Encrypt cert for the API custom domain (api.cardine.azlabs.it).
  ssl_certificate {
    name     = "cert-api"
    data     = filebase64(var.appgw_cert_pfx_path)
    password = var.appgw_cert_password
  }

  frontend_ip_configuration {
    name                 = "feip"
    public_ip_address_id = azurerm_public_ip.appgw.id
  }

  # Backend resolves to the App Service private endpoint via the linked private
  # DNS zone (privatelink.azurewebsites.net).
  backend_address_pool {
    name  = "beap-appsvc"
    fqdns = [azurerm_linux_web_app.main.default_hostname]
  }

  probe {
    name                                      = "probe-appsvc"
    protocol                                  = "Https"
    path                                      = "/api/health"
    pick_host_name_from_backend_http_settings = true
    interval                                  = 30
    timeout                                   = 30
    unhealthy_threshold                       = 3

    match {
      status_code = ["200-399", "401", "403", "404"]
    }
  }

  backend_http_settings {
    name                                = "behs-appsvc"
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 30
    pick_host_name_from_backend_address = true
    probe_name                          = "probe-appsvc"
  }

  http_listener {
    name                           = "listener-http"
    frontend_ip_configuration_name = "feip"
    frontend_port_name             = "port-80"
    protocol                       = "Http"
  }

  http_listener {
    name                           = "listener-https"
    frontend_ip_configuration_name = "feip"
    frontend_port_name             = "port-443"
    protocol                       = "Https"
    host_name                      = var.api_custom_domain
    ssl_certificate_name           = "cert-api"
  }

  request_routing_rule {
    name                       = "rule-http"
    rule_type                  = "Basic"
    priority                   = 100
    http_listener_name         = "listener-http"
    backend_address_pool_name  = "beap-appsvc"
    backend_http_settings_name = "behs-appsvc"
  }

  request_routing_rule {
    name                       = "rule-https"
    rule_type                  = "Basic"
    priority                   = 110
    http_listener_name         = "listener-https"
    backend_address_pool_name  = "beap-appsvc"
    backend_http_settings_name = "behs-appsvc"
  }

  depends_on = [azurerm_private_endpoint.appsvc]
}
