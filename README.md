# Cardine

**Cardine** è una piattaforma B2B di career counseling che aiuta i dipendenti a orientarsi nel proprio percorso professionale all'interno dell'organizzazione.

Il differenziatore di Cardine è il punto di partenza: invece di chiedere *"dove vuoi essere tra cinque anni?"* — domanda a cui difficilmente si risponde con precisione — Cardine mappa le competenze attuali del dipendente contro i ruoli reali dell'azienda, calcola la prossimità a ciascun ruolo e genera un percorso concreto per colmare il gap.

**Crescita interna, non mobilità esterna.**

---

## Come funziona

1. Il profilo del dipendente viene importato dalla piattaforma interna aziendale tramite connettore *(per il MVP: pre-caricato)*.
2. L'AI estrae le competenze rilevanti e le mappa sul catalogo dei ruoli del Tenant.
3. Cardine calcola un **Proximity Score** per ogni ruolo: *"Sei al 78% da Team Lead, al 61% da Solution Architect"*.
4. Il dipendente sceglie il **Ruolo Target** e l'LLM genera in streaming una **Roadmap** strutturata (corsi, certificazioni, milestone operative).
5. Il dipendente può raffinare la roadmap con input in linguaggio naturale (**Ciclo di Raffinamento**) e confermarla.
6. Il **Career Counselor** vede la roadmap confermata e la usa come base per i colloqui di sviluppo.

---

## Attori

| Attore | Ruolo |
|---|---|
| **Dipendente** | Esplora il proprio percorso in self-service |
| **Career Counselor** | Monitora il gruppo, prepara i colloqui di sviluppo |
| **HR Admin** | Configura il catalogo dei ruoli e i profili del Tenant |

> Il glossario completo del dominio è in [`CONTEXT.md`](./CONTEXT.md).

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Backend | Node.js + TypeScript — REST API |
| Database | PostgreSQL 16 |
| LLM | Azure OpenAI (GPT-4o) |
| Autenticazione | JWT + refresh token rotation |
| Streaming | Server-Sent Events (SSE) per le risposte LLM in tempo reale |
| Hosting | Azure App Service + Azure Static Web Apps |

---

## Architettura

Cardine è un **monolite REST API** composto da quattro domini interni:

```
┌──────────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                      │
│         Dipendente  │  Career Counselor  │  HR Admin         │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTPS / REST + SSE
┌──────────────────────────▼───────────────────────────────────┐
│                    NODE.JS REST API                           │
│                                                               │
│   Auth (JWT)  │  Catalogo Service  │  Gap Analysis Service   │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │                 LLM Pipeline Service                   │   │
│   │  Pipeline 1 — Estrazione Competenze dal Profilo        │   │
│   │  Pipeline 2 — Proximity Scoring (algo + LLM)           │   │
│   │  Pipeline 3 — Roadmap Generation + Refinement Loop     │   │
│   └──────────────────────┬────────────────────────────────┘   │
└─────────────────────────┬┴──────────────────────────────────┘
              ┌───────────┼────────────┐
              ▼           ▼            ▼
        PostgreSQL    Azure OpenAI   Connettore
        (app data)    (GPT-4o)       Piattaforma
```

### Pipeline LLM

| Pipeline | Input | Output | Tecnica |
|---|---|---|---|
| **1 — Estrazione Profilo** | Dati profilo dal connettore | Lista Competenze mappate sul Catalogo | Few-shot prompting |
| **2 — Proximity Scoring** | Profilo Competenze + Ruoli con pesi | Ruoli ordinati per score + Gap dettagliato | Scoring algoritmico ponderato + LLM qualitativo |
| **3 — Roadmap + Ciclo di Raffinamento** | Gap analysis + input utente (opzionale) | Roadmap strutturata JSON + streaming | Structured output (JSON mode) + SSE |

---

## Struttura del Progetto

```
Cardine/
├── CONTEXT.md                        # Glossario del dominio (fonte di verità sui termini)
├── README.md                         # Questo file
├── docs/
│   ├── adr/
│   │   ├── 0001-azure-openai-llm-provider.md
│   │   ├── 0002-rest-monolith-fase-1.md
│   │   ├── 0003-postgresql-no-vector-db.md
│   │   └── 0004-azure-infra-spec.md   # Specifiche infrastruttura Azure (uso interno)
│   └── offerta/
│       ├── analisi-architettura-stima.md   # Documento di offerta (MD)
│       ├── analisi-architettura-stima.docx # Documento di offerta (Word AGIC)
│       ├── cardine-presentazione.pptx      # Pitch deck (PowerPoint AGIC)
│       └── stitch-design-spec.md           # Specifica UI per Google Stitch
```

> Il codice sorgente (frontend e backend) sarà aggiunto sotto `src/` all'avvio dello sviluppo.

---

## Decisioni Architetturali (ADR)

Le decisioni strutturali sono documentate in `docs/adr/`. Le principali:

### [ADR-0001] Azure OpenAI invece di OpenAI diretto
Il prodotto è B2B enterprise con clienti EU. I dati di profilo e competenze dei dipendenti sono sensibili (GDPR). Azure OpenAI garantisce data residency EU, contratti enterprise conformi al GDPR e SLA garantito. I modelli sono identici a OpenAI; cambia il piano contrattuale e l'infrastruttura.

### [ADR-0002] Monolite REST API per la Fase 1
I confini tra i domini (catalogo, gap analysis, LLM pipeline, roadmap) non sono ancora validati dall'uso reale. Separare in microservizi prima di conoscere le linee di frattura avrebbe prodotto servizi mal tagliati e costosi da rifattorizzare. Il monolite permette velocità di sviluppo e validazione del prodotto. La separazione è pianificata per la Fase 2.

### [ADR-0003] PostgreSQL con pg_trgm — Elasticsearch e vector DB scartati
Il Proximity Score usa un algoritmo di matching ponderato in application code. **Elasticsearch** è stato valutato per il fuzzy matching sui nomi di competenza ma scartato: richiederebbe un secondo database accanto a PostgreSQL (i dati relazionali non possono stare in ES), aggiungendo complessità operativa e costi cluster senza vantaggi per il volume del MVP. Il fuzzy matching è risolto con **`pg_trgm`** — già dentro PostgreSQL, zero infrastruttura aggiuntiva. Da rivalutare se il catalogo supera ~50.000 competenze distinte.

---

## Infrastruttura Azure (Produzione)

Ambiente di produzione su Azure in regione EU (pilota, <20 utenti). Dettaglio completo in [`docs/adr/0004-azure-infra-spec.md`](./docs/adr/0004-azure-infra-spec.md).

| Risorsa | SKU | Nota |
|---|---|---|
| App Service B2 | Basic · 2 vCore · 3.5 GB | Piano base |
| **App Service P2v3** | **Premium · 4 vCore · 16 GB** | **Obbligatorio per VNet Integration outbound** |
| Static Web Apps | Standard | Frontend React + CDN |
| PostgreSQL Flexible | B1ms · 1 vCore · 2 GB | Database principale |
| Azure OpenAI (GPT-4o) | Pay-per-use | LLM, data residency EU |
| Application Gateway WAF v2 | WAF_v2 | Ingresso HTTPS, protezione OWASP, SSL termination |
| Private Endpoint × 3 | — | PostgreSQL, OpenAI, Key Vault — isolamento dalla rete pubblica |
| Key Vault | Standard | Secrets e certificati |
| Virtual Network | — | Infrastruttura base per Private Endpoint e VNet Integration |

> **Nota critica**: il tier **Premium P2v3** è necessario perché il tier Basic non supporta il VNet Integration outbound. Senza di esso il backend non riesce a raggiungere PostgreSQL, OpenAI e Key Vault attraverso i Private Endpoint.

---

## Modello Dati (Alto Livello)

```
Tenant
  ├── Ruolo (N)
  │     └── RuoloCompetenza (N) → Competenza [peso: 1-5]
  └── Dipendente (N)
        ├── livello (assegnato da HR Admin)
        ├── ProfiloCompetenze (1)
        │     └── ProfiloCompetenzaDettaglio (N) → Competenza [score estratto da LLM]
        └── Roadmap (N)
              └── RoadmapItem (N) [tipo: corso | milestone | certificazione]

CareerCounselor (appartiene a Tenant)
  └── supervisiona → Dipendente (N)
```

---

## Scope MVP (Fase 1)

**Incluso:**
- Autenticazione JWT con tre ruoli: HR Admin, Career Counselor, Dipendente
- Catalogo base Cardine pre-caricato, personalizzabile dall'HR Admin
- Profili dipendenti pre-caricati (il connettore alla piattaforma interna è uno stub)
- Flusso completo Dipendente: profilo → estrazione competenze → proximity map → ruolo target → roadmap (streaming) → ciclo di raffinamento → conferma
- Dashboard Career Counselor: lista dipendenti, gap summary, roadmap confermate
- Interfaccia HR Admin: gestione catalogo, gestione profili
- UI responsive, desktop-first
- Deployment su Azure (ambiente produzione)

**Escluso (Fase 2+):**
- Connettore reale verso HRIS esterni (SAP SuccessFactors, Workday, BambooHR)
- Marketplace corsi esterni (Coursera, LinkedIn Learning)
- App mobile nativa
- Analytics HR avanzate e reportistica
- Notifiche e reminder automatici
- Multi-lingua

---

## Piano di Lavoro — Fase 1

| Settimane | Focus | Deliverable |
|---|---|---|
| 1–2 | Setup e design | Architettura di dettaglio, wireframe UX, ambienti configurati |
| 3–4 | Core backend | Auth, modello dati, catalogo CRUD, connettore stub |
| 5–6 | LLM Pipeline | Estrazione competenze, proximity scoring, generazione roadmap con streaming |
| 7–8 | Frontend | Flusso Dipendente completo (proximity map, roadmap, ciclo di raffinamento) |
| 9 | Integrazione | Dashboard Counselor, interfaccia HR Admin, test end-to-end |
| 10 | Hardening | Bug fixing, performance, deploy produzione, documentazione |

**Team**: Tech Lead (F), 2× Fullstack Developer (D), UX/UI Designer (C), Project Manager (D), Analista/Tester (C) — 175 giorni-uomo totali.

---

## Sicurezza e GDPR

- Dati profilo e competenze dei dipendenti ospitati esclusivamente su infrastruttura Azure in regione EU
- Azure OpenAI: i dati inviati non vengono usati per addestrare i modelli (contratto enterprise)
- JWT con scadenza breve (15 min) + refresh token rotation
- Row-level security su PostgreSQL per isolamento dati per Tenant
- Audit trail degli accessi ai dati sensibili
- Servizi sensibili (DB, LLM API, Key Vault) accessibili solo via Private Endpoint — mai esposti sulla rete pubblica

---

## Documentazione di Riferimento

| File | Contenuto |
|---|---|
| [`CONTEXT.md`](./CONTEXT.md) | Glossario dominio: attori, competenze, gap, roadmap |
| [`docs/adr/0001`](./docs/adr/0001-azure-openai-llm-provider.md) | Scelta Azure OpenAI vs OpenAI diretto |
| [`docs/adr/0002`](./docs/adr/0002-rest-monolith-fase-1.md) | Scelta monolite REST vs microservizi |
| [`docs/adr/0003`](./docs/adr/0003-postgresql-no-vector-db.md) | Scelta PostgreSQL vs vector DB |
| [`docs/adr/0004`](./docs/adr/0004-azure-infra-spec.md) | Specifiche complete infrastruttura Azure |
| [`docs/offerta/analisi-architettura-stima.md`](./docs/offerta/analisi-architettura-stima.md) | Documento di offerta completo |
| [`docs/offerta/stitch-design-spec.md`](./docs/offerta/stitch-design-spec.md) | Specifica UI per Google Stitch (5 schermate) |

---

*Cardine — v1.0 — Giugno 2026*