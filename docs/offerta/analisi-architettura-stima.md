# Cardine — Analisi Funzionale, Architettura, Stima e Offerta

**Versione**: 1.0
**Data**: Giugno 2026
**Classificazione**: Riservato

---

## 1. Executive Summary

Cardine è una piattaforma B2B di career counseling che risolve un problema concreto nelle organizzazioni: i dipendenti non sanno dove possono arrivare all'interno della propria azienda, e l'azienda non ha strumenti per mostrarglielo.

Il differenziatore di Cardine è il punto di partenza: invece di chiedere "dove vuoi essere tra cinque anni?" — domanda a cui nessuno sa rispondere con precisione — Cardine mappa le competenze attuali del dipendente contro i ruoli reali dell'organizzazione, calcola la prossimità a ciascun ruolo e genera un percorso concreto per colmare il gap. **Crescita interna, non mobilità esterna.**

Il core dell'esperienza utente è generato in tempo reale da un Large Language Model: Cardine importa il profilo del dipendente dalla piattaforma interna aziendale tramite connettore dedicato e produce immediatamente una mappa visuale dei ruoli più vicini al suo profilo, con i gap specifici e una roadmap strutturata per colmarli. Il Ciclo di Raffinamento permette al dipendente di adattare la proposta alle proprie esigenze reali con un semplice input in linguaggio naturale.

---

## 2. Analisi Funzionale

### 2.1 Contesto

Il Career Counselor aziendale ha il compito di accompagnare il dipendente nel percorso professionale interno. Il suo valore si misura dalla capacità di mettere in relazione aspirazioni del dipendente, competenze possedute e opportunità disponibili in azienda.

Oggi questa attività è svolta manualmente, con strumenti generici (fogli di calcolo, presentazioni, colloqui informali), senza un sistema che aggreghi e confronti in modo strutturato i dati di competenza con il catalogo dei ruoli aziendali. Il risultato è un processo lento, poco ripetibile e difficile da monitorare.

Cardine digitalizza e potenzia questo processo: fornisce al Career Counselor uno strumento di analisi strutturata e al Dipendente un'interfaccia self-service per esplorare il proprio percorso in autonomia.

### 2.2 Attori del sistema

| Attore | Descrizione | Azioni principali |
|---|---|---|
| **HR Admin** | Configura il sistema per il Tenant | Gestisce il catalogo dei ruoli, assegna i livelli ai dipendenti, gestisce i profili utente |
| **Career Counselor** | Accompagna il dipendente nel percorso professionale | Visualizza gap e roadmap dei dipendenti del proprio gruppo, prepara i colloqui di sviluppo |
| **Dipendente** | Esplora il proprio percorso professionale in self-service | Accede al proprio profilo importato dalla piattaforma interna, visualizza la mappa di prossimità, sceglie il ruolo target, genera e raffina la roadmap |

### 2.3 Flusso principale — Dipendente

```
1. IMPORTAZIONE PROFILO
   Il sistema importa il profilo del Dipendente (dati anagrafici, ruolo corrente,
   storico esperienze e competenze dichiarate) dalla piattaforma interna aziendale
   tramite connettore. Per il MVP, i profili sono pre-caricati nel sistema.

2. ESTRAZIONE COMPETENZE  [LLM]
   Il sistema invia il profilo del Dipendente ad Azure OpenAI, che estrae le parole
   chiave rilevanti e le mappa sulle Competenze del Catalogo del Tenant.
   Viene generato il Profilo Competenze del Dipendente.

3. CALCOLO PROXIMITY SCORE
   Per ogni Ruolo del Catalogo compatibile con il Livello HR del Dipendente,
   il sistema calcola il Proximity Score: percentuale di competenze soddisfatte,
   pesate per importanza relativa al ruolo.

4. MAPPA VISUALE DEI RUOLI
   Il Dipendente visualizza i Ruoli ordinati per Proximity Score, con il Gap
   dettagliato per ciascuno.
   Esempio: "Team Lead 78% | Solution Architect 61% | Engineering Manager 45%"

5. SELEZIONE RUOLO TARGET
   Il Dipendente seleziona il Ruolo Target verso cui vuole orientarsi.

6. GENERAZIONE ROADMAP  [LLM]
   Il sistema genera una Roadmap strutturata che include:
   — Corsi e certificazioni per ogni Competenza mancante
   — Milestone operative (esperienze lavorative interne consigliate)
   — Sequenza temporale indicativa
   La risposta è streamata in tempo reale al browser.

7. CICLO DI RAFFINAMENTO
   Il Dipendente può:
   a) CONFERMARE la Roadmap → salvata nel profilo, visibile al Career Counselor
   b) INSERIRE UN INPUT LIBERO → es. "conosco già Agile", "solo 3 mesi disponibili"
      Il sistema genera una nuova Roadmap incorporando il feedback.
      Il ciclo si ripete fino alla conferma.
```

### 2.4 Funzionalità per ruolo

#### HR Admin
- Gestione del catalogo ruoli (CRUD su Ruoli e Competenze, partendo dal catalogo base Cardine)
- Gestione dei profili dipendenti (assegnazione del Livello, attivazione account)
- Per il MVP: profili pre-caricati, nessuna integrazione con sistemi HRIS esterni

#### Career Counselor
- Dashboard dei Dipendenti del proprio gruppo con sintesi del Proximity Score verso il ruolo target corrente
- Accesso alla Roadmap confermata di ogni Dipendente
- Storico delle Roadmap generate (evoluzione nel tempo del profilo)

#### Dipendente
- Flusso completo Profilo → Mappa di prossimità → Roadmap
- Visualizzazione del Gap dettagliato per ogni Ruolo
- Ciclo di Raffinamento della Roadmap con input in linguaggio naturale
- Profilo personale con storico delle Roadmap confermate

---

## 3. Architettura Tecnica

### 3.1 Stack tecnologico

| Layer | Tecnologia | Motivazione |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Standard de facto per SPA enterprise; ecosistema maturo per data visualization e streaming LLM |
| **Backend** | Node.js + TypeScript | Coerenza linguistica con il frontend; supporto nativo allo streaming HTTP (SSE) per le risposte LLM in tempo reale |
| **Database** | PostgreSQL 16 | Affidabilità, maturità, supporto JSON nativo per strutture flessibili (es. competenze estratte) |
| **LLM Provider** | Azure OpenAI (GPT-4o) | Data residency EU, contratti enterprise GDPR-compliant, SLA garantito; modelli identici a OpenAI |
| **Autenticazione** | JWT + refresh token | Stateless, compatibile con architettura REST monolitica |
| **Hosting** | Azure App Service + Azure Database for PostgreSQL | Coerenza con il provider LLM; data residency EU garantita end-to-end |

### 3.2 Architettura applicativa

Cardine è sviluppato come **monolite REST API** per la Fase 1. Questa scelta è deliberata: riduce la complessità operativa, accelera lo sviluppo del MVP e posticipa la separazione in microservizi al momento in cui i confini tra i domini saranno validati dall'uso reale.

```
┌──────────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                      │
│   ┌──────────────┐  ┌────────────────┐  ┌────────────────┐   │
│   │  Dipendente  │  │Career Counselor│  │   HR Admin     │   │
│   └──────┬───────┘  └───────┬────────┘  └───────┬────────┘   │
└──────────┼──────────────────┼───────────────────┼────────────┘
           │                  │                   │
           └──────────────────┼───────────────────┘
                              │  HTTPS / REST + SSE (streaming)
┌─────────────────────────────▼────────────────────────────────┐
│                    NODE.JS REST API                          │
│                                                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Auth (JWT)  │  │ Catalogo Service│  │  Gap Analysis   │  │
│  └──────────────┘  └─────────────────┘  │  Service        │  │
│                                         └────────┬────────┘  │
│  ┌──────────────────────────────────────────────▼─────────┐  │
│  │                  LLM Pipeline Service                   │  │
│  │  Pipeline 1: Profilo Extraction (da connettore)         │  │
│  │  Pipeline 2: Proximity Scoring (algo + LLM qualitativo) │  │
│  │  Pipeline 3: Roadmap Generation + Refinement Loop       │  │
│  └──────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
               ┌──────────┼──────────────┐
               ▼          ▼              ▼
       ┌────────────┐  ┌──────────┐  ┌──────────────┐
       │ PostgreSQL │  │  Azure   │  │  Connettore  │
       │ (app data) │  │ OpenAI   │  │  Piattaforma │
       └────────────┘  └──────────┘  └──────────────┘
```

### 3.3 Pipeline LLM

La pipeline LLM è il nucleo differenziante di Cardine. È composta da tre catene di prompt distinte:

**Pipeline 1 — Estrazione Competenze dal Profilo**
- Input: dati del profilo del Dipendente importati dalla piattaforma interna (esperienze, ruolo corrente, competenze dichiarate)
- Output: lista di Competenze con livello di padronanza, mappata sulle Competenze del Catalogo
- Tecnica: few-shot prompting con esempi di mapping competenza → catalogo

**Pipeline 2 — Proximity Scoring e Ranking**
- Input: Profilo Competenze + lista Ruoli con competenze richieste e pesi
- Output: lista Ruoli ordinata per Proximity Score con Gap dettagliato
- Tecnica: scoring algoritmico ponderato in application code; LLM per valutazione qualitativa del gap e arricchimento descrittivo

**Pipeline 3 — Generazione e Raffinamento Roadmap**
- Input: Gap analysis, Ruolo Target, catalogo corsi/milestone, input libero del Dipendente (opzionale nel Ciclo di Raffinamento)
- Output: Roadmap strutturata in JSON (corsi, milestone, timeline)
- Tecnica: structured output (JSON mode), chain of thought per la sequenzializzazione
- La risposta è streamata al frontend via **Server-Sent Events** per l'effetto generazione in tempo reale

### 3.4 Modello dati (alto livello)

```
Tenant
  ├── Ruolo (N)
  │     └── RuoloCompetenza (N) → Competenza [con peso]
  └── Dipendente (N)
        ├── livello (FK → Livello, assegnato da HR Admin)
        ├── ProfiloCompetenze (1)
        │     └── ProfiloCompetenzaDettaglio (N) → Competenza [con score]
        └── Roadmap (N)
              └── RoadmapItem (N)  [tipo: corso | milestone]

CareerCounselor (appartiene a Tenant)
  └── supervisiona → Dipendente (N)
```

### 3.5 Sicurezza e compliance GDPR

- I dati dei dipendenti (profilo, competenze, roadmap) risiedono esclusivamente su infrastruttura Azure in regione EU
- Azure OpenAI non utilizza i dati inviati per addestrare i modelli (per contratto enterprise)
- I dati del profilo importati dal connettore vengono processati e non conservati oltre il necessario — solo il Profilo Competenze estratto viene persistito
- JWT con scadenza breve (15 min) + refresh token rotation
- Isolamento dati per Tenant tramite row-level security su PostgreSQL
- Audit trail degli accessi ai dati sensibili

---

## 4. Piano di Lavoro — Fase 1 (MVP)

### 4.1 Scope del MVP

**Incluso:**
- Autenticazione e gestione utenti (tre ruoli: HR Admin, Career Counselor, Dipendente)
- Catalogo base Cardine pre-caricato, personalizzabile dall'HR Admin
- Profili dipendenti pre-caricati (nessuna integrazione HRIS)
- Flusso completo Dipendente: importazione profilo da piattaforma interna → estrazione competenze → mappa di prossimità → selezione Ruolo Target → generazione Roadmap → Ciclo di Raffinamento → conferma
- Dashboard Career Counselor: lista Dipendenti, sintesi Gap, Roadmap confermate
- Interfaccia HR Admin: gestione Catalogo, gestione profili
- UI responsive (desktop-first, accessibile da browser mobile)
- Deployment su Azure (ambienti staging e produzione)

**Escluso (Fase 2+):**
- Integrazione con HRIS esterni (SAP SuccessFactors, Workday, BambooHR)
- Marketplace corsi esterni (Coursera, LinkedIn Learning)
- App mobile nativa (iOS/Android)
- Analytics avanzate e reportistica HR
- Notifiche e reminder automatici
- Multi-lingua

### 4.2 Milestone e deliverable

| Settimana | Milestone | Deliverable |
|---|---|---|
| 1–2 | Setup e design | Architettura di dettaglio, wireframe UX approvati, ambienti di sviluppo configurati |
| 3–4 | Core backend | API autenticazione, modello dati, catalogo CRUD, integrazione connettore piattaforma interna (stub per MVP) |
| 5–6 | LLM Pipeline | Estrazione competenze, proximity scoring, generazione Roadmap con streaming |
| 7–8 | Frontend | Flusso Dipendente completo (mappa visuale, roadmap, Ciclo di Raffinamento) |
| 9 | Integrazione e testing | Dashboard Counselor, interfaccia HR Admin, test di integrazione end-to-end |
| 10 | Hardening e deploy | Bug fixing, ottimizzazione performance, deploy produzione, documentazione tecnica |

### 4.3 Metodologia

Il progetto è condotto con metodologia **Agile/Scrum** con sprint di 2 settimane. Le cerimonie includono sprint planning, daily standup (async), sprint review con il cliente e retrospettiva. Il backlog è gestito su strumento concordato con il cliente (Jira, Linear o equivalente).

---

## 5. Proposta Economica

### 5.1 Costo di Sviluppo — Fase 1 (MVP)

La realizzazione del MVP Cardine è proposta a **forfait fisso**, comprensivo di tutte le attività di analisi, progettazione, sviluppo, testing e deployment descritte al §4.

| Voce | Importo |
|---|---|
| Sviluppo e implementazione Fase 1 — MVP (prezzo di listino) | ~~€ 134.500~~ |
| **Sconto commerciale applicato** | **− € 24.500 (18%)** |
| **Prezzo offerto** | **€ 110.000 + IVA** |

La prestazione include un team dedicato composto da Tech Lead, due Fullstack Developer, UX/UI Designer, Project Manager e Analista Funzionale/Tester, per una durata complessiva di **10 settimane** (50 giorni lavorativi).

Il perimetro di fornitura è quello definito al §4.1 (Scope del MVP). Variazioni significative di scope concordate in corso d'opera saranno soggette a revisione economica separata.

### 5.2 Stima Costi Infrastrutturali — Ambiente di Produzione

I costi infrastrutturali sono a carico del cliente sulla propria subscription Microsoft Azure e **non sono inclusi** nel forfait di sviluppo al §5.1. Una stima dettagliata dei costi operativi sarà fornita su richiesta.

L'architettura di produzione prevede i seguenti servizi Azure in regione EU:

- **App Service** (Basic + Premium P2v3) — hosting backend Node.js con VNet Integration
- **Azure Static Web Apps** — hosting frontend React con CDN
- **Azure Database for PostgreSQL Flexible** — database relazionale
- **Azure OpenAI Service (GPT-4o)** — LLM pipeline, data residency EU
- **Azure Application Gateway WAF v2** — ingresso HTTPS con firewall applicativo OWASP
- **Azure Private Endpoint × 3** — isolamento di rete per PostgreSQL, OpenAI e Key Vault
- **Azure Key Vault** — gestione secrets e certificati
- **Azure Virtual Network** — rete privata di riferimento per Private Endpoint e VNet Integration

---

## 6. Roadmap Fasi Successive

### Fase 2 — Consolidamento (stimato: 6–8 settimane)
- Multi-tenancy completa con onboarding HR self-service
- Integrazione con almeno un HRIS esterno (via API)
- Analytics per Career Counselor (trend competenze, progress tracking)
- Sistema di notifiche e reminder per le milestone della Roadmap
- Reportistica HR (export PDF/Excel)

### Fase 3 — Evoluzione (da pianificare)
- App mobile nativa (iOS e Android)
- Marketplace corsi con integrazione piattaforme e-learning esterne
- Benchmark competenze cross-aziendali (dato aggregato anonimizzato)
- Suggerimento proattivo AI-driven: "questo dipendente è pronto per il passaggio di livello"

---

## 7. Condizioni

- La presente offerta si riferisce esclusivamente alla **Fase 1 (MVP)** come descritta al §4.
- La stima è basata sul perimetro funzionale definito. Variazioni significative di scope saranno soggette a revisione della stima concordata tra le parti.
- I costi infrastrutturali Azure sono a carico del cliente e non inclusi nel forfait al §5.1. Una stima operativa dettagliata sarà fornita su richiesta.
- Il contratto di fornitura Azure OpenAI (data residency EU, garanzie GDPR) è responsabilità del cliente o può essere gestito dalla società fornitrice su mandato esplicito.
- La validità dell'offerta è di **60 giorni** dalla data di emissione.

---

*Cardine — Analisi, Architettura, Stima e Offerta — v1.0 — Giugno 2026*
