# Cardine — Infrastructure (Terraform)

Azure infrastructure for the **Cardine** demo: a production-faithful topology
(App Gateway WAF → private App Service → private PostgreSQL, Key Vault, Static
Web App) deployed for a team-building demo.

> Throwaway demo environment. State is local; the LLM is mocked
> (`LLM_MODE=mock`, Azure OpenAI disabled by default).

## Architecture

```
Internet
  ├── https://cardine.azlabs.it      → Static Web App (React frontend, managed TLS)
  └── https://api.cardine.azlabs.it  → App Gateway WAF_v2 (OWASP, Let's Encrypt)
                                          → Private Endpoint → App Service (Node, private)
                                                                 ├── Private Endpoint → PostgreSQL Flexible
                                                                 └── Private Endpoint → Key Vault
```

All data-plane resources (App Service, PostgreSQL, Key Vault) are private, reached
through private endpoints with VNet-linked private DNS zones. PostgreSQL runs in
`northeurope` (some subscriptions are offer-restricted for it in `westeurope`) and
is reached cross-region via its private endpoint.

## Prerequisites

- Terraform >= 1.5, Azure CLI
- An authenticated Azure session: `az login` (the provider uses the CLI session)
- A PFX certificate for the API custom domain (see below)

## Usage

```bash
cp env/demo.tfvars.example env/demo.tfvars   # fill in subscription_id / tenant_id

# The App Gateway HTTPS listener needs a PFX for the API domain. Provide its
# password via env var (never commit it or the PFX):
export TF_VAR_appgw_cert_password="<pfx-password>"

terraform init
terraform plan  -var-file=env/demo.tfvars
terraform apply -var-file=env/demo.tfvars
```

### API certificate

The App Gateway terminates TLS for `api.cardine.azlabs.it` with a Let's Encrypt
certificate (issued out-of-band via DNS-01, since the DNS zone lives in a separate
subscription). Place the resulting `api-cardine.pfx` in this directory and set
`TF_VAR_appgw_cert_password`. The PFX and its password are gitignored.

The frontend domain (`cardine.azlabs.it`) uses the Static Web App's free managed
certificate — no manual cert needed there.

## Teardown

```bash
export TF_VAR_appgw_cert_password="$(cat .pfxpass)"
terraform destroy -var-file=env/demo.tfvars
```

DNS records for the custom domains live in the `azlabs.it` zone (separate
subscription) and are managed outside this Terraform.

## Layout

| File | Purpose |
|------|---------|
| `network.tf`     | VNet, subnets (appgw / appsvc-delegated / private-endpoints) |
| `dns.tf`         | Private DNS zones + VNet links |
| `appgw.tf`       | Application Gateway WAF_v2, listeners (HTTP/HTTPS), routing |
| `appservice.tf`  | App Service plan + Linux web app + private endpoint |
| `frontend.tf`    | Static Web App |
| `database.tf`    | PostgreSQL Flexible Server + database + private endpoint |
| `keyvault.tf`    | Key Vault, access policies, DB secret, private endpoint |
| `monitoring.tf`  | Log Analytics + Application Insights |
| `openai.tf`      | Azure OpenAI + private endpoint (disabled by default) |
