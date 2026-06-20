# Azure Infrastructure — Specifiche di Riferimento per lo Sviluppo

Le risorse Azure selezionate per l'ambiente di produzione Cardine (pilota, <20 utenti).
Questa specifica è ad uso interno del team di sviluppo e non è inclusa nel documento di offerta al cliente.

## Risorse selezionate

| Risorsa | SKU | Note |
|---|---|---|
| Azure App Service — Backend (Basic) | B2 · 2 vCore · 3.5 GB | Piano base |
| Azure App Service — Backend (Premium) | P2v3 · 4 vCore · 16 GB | Richiesto per VNet Integration outbound verso Private Endpoint |
| Azure Static Web Apps — Frontend | Standard | SPA React, CDN Azure inclusa |
| Azure Database for PostgreSQL Flexible | B1ms · 1 vCore · 2 GB · 32 GB storage | Backup automatici 7 gg inclusi |
| Azure OpenAI Service (GPT-4o) | Pay-per-use | Data residency EU, GDPR-compliant |
| Azure Key Vault | Standard | Secrets, connection strings, API keys |
| Azure Blob Storage | LRS Standard | Log export, file di configurazione |
| Azure Application Insights | Pay-per-use | Free tier per <20 utenti |
| Azure Application Gateway WAF v2 | WAF_v2 · fixed + min 1 CU | Protezione OWASP, DDoS layer 7, SSL termination |
| Azure Private Endpoint × 3 | 1 per PostgreSQL, 1 per OpenAI, 1 per Key Vault | Isolamento servizi sensibili dal pubblico internet |
| Azure Virtual Network | VNet + subnet | Infrastruttura base per Private Endpoint e VNet Integration |

## Note architetturali

- Il tier **App Service Premium (P2v3)** è obbligatorio per abilitare il **VNet Integration outbound**: permette al backend Node.js di raggiungere PostgreSQL, Azure OpenAI e Key Vault attraverso i rispettivi Private Endpoint senza transitare dalla rete pubblica.
- L'**Application Gateway WAF v2** espone il backend su HTTPS con firewall applicativo (ruleset OWASP 3.2), protezione DDoS layer 7 e SSL termination. È il punto di ingresso unico verso l'App Service.
- I **tre Private Endpoint** (PostgreSQL, OpenAI, Key Vault) rendono i servizi sensibili raggiungibili esclusivamente tramite indirizzo IP privato all'interno della VNet, eliminando l'esposizione su internet pubblico.
- La regione Azure target è **EU West** (o EU North) per garantire data residency EU e conformità GDPR.

## Stima costi (solo riferimento interno)

| Risorsa | €/mese stimato |
|---|---|
| App Service B2 (Basic) | € 65 |
| App Service P2v3 (Premium) | € 230 |
| Static Web Apps | € 9 |
| PostgreSQL Flexible B1ms | € 25 |
| Azure OpenAI GPT-4o | ~ € 10 |
| Key Vault | € 5 |
| Blob Storage | € 2 |
| Application Insights | € 0 |
| Application Gateway WAF v2 | € 330 |
| Private Endpoint × 3 | € 21 |
| **TOTALE MENSILE** | **≈ € 697** |

*Stima indicativa per <20 utenti. Il costo OpenAI è proporzionale all'utilizzo reale.*
