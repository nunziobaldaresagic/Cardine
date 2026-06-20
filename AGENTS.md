# AGENTS.md

Istruzioni operative per tutti gli agenti AI che lavorano su questo repository.

---

## Progetto: Cardine

Cardine è una piattaforma B2B di career counseling che mappa le competenze del dipendente contro i ruoli reali dell'azienda, calcola la prossimità a ciascun ruolo (Proximity Score) e genera una Roadmap personalizzata tramite LLM.

**Stack**: React 18 + TypeScript (frontend) · Node.js + TypeScript (backend REST) · PostgreSQL 16 · Azure OpenAI GPT-4o  
**Architettura**: monolite REST API per il MVP — nessun microservizio  
**Hosting**: Azure (App Service P2v3 + Static Web Apps + PostgreSQL Flexible + WAF v2)

Prima di lavorare sul codice leggi:
- [`CONTEXT.md`](./CONTEXT.md) — glossario del dominio (fonte di verità sui termini)
- [`README.md`](./README.md) — architettura, stack, scope MVP, decisioni chiave
- [`docs/adr/`](./docs/adr/) — decisioni architetturali documentate

---

## 1. Worktree paralleli

Quando più agenti lavorano contemporaneamente, **ognuno lavora sul proprio git worktree** — mai sullo stesso branch.

```bash
# Creare un worktree dedicato prima di iniziare
git worktree add ../cardine-<feature-name> -b <feature-name>

# Lavorare nel proprio worktree
cd ../cardine-<feature-name>

# Al termine, rimuovere il worktree
git worktree remove ../cardine-<feature-name>
```

**Regola**: nessun agente modifica file su un branch già in uso da un altro agente. Se il branch esiste già, creare un nuovo worktree con branch separato e aprire una PR di merge.

---

## 2. Skill disponibili

Le skill si trovano in `.agents/skills/`. **Usa sempre la skill appropriata invece di reinventare la ruota.**

| Skill | Path | Quando usarla |
|---|---|---|
| `agic-docx` | `.agents/skills/agic-docx/` | Creare o modificare documenti `.docx` con il template AGIC (offerte, report, documentazione formale) |
| `agic-pptx` | `.agents/skills/agic-pptx/` | Creare o modificare presentazioni `.pptx` con il template AGIC (pitch deck, slide) |

Ogni skill ha un file di istruzioni interno. **Leggilo sempre prima di usarla.**

```bash
# Esempio: prima di generare un DOCX
cat .agents/skills/agic-docx/references/workflows.md
```

Se un task richiede la produzione di un documento Word o PowerPoint con branding AGIC, **la skill è obbligatoria** — non usare pandoc grezzo o librerie alternative.

---

## 3. Mentalità startup — semplicità prima di tutto

Siamo in fase MVP. Il codice deve funzionare e essere leggibile. Non deve essere scalabile a Google.

**Regole concrete:**

- **Nessun pattern enterprise**: no repository pattern, no CQRS, no event sourcing, no saga, no DI container. Funzioni semplici e moduli.
- **Nessuna astrazione prematura**: se una cosa è usata una volta sola, non astrarre. Astrai solo quando hai almeno 3 usi concreti.
- **Nessuna libreria "per sicurezza"**: aggiungi una dipendenza solo se risolve un problema reale oggi, non uno futuro.
- **API flat e leggibili**: nessun layer di mapping intermedio se i dati possono andare diretti.
- **Errori espliciti**: `throw new Error("messaggio chiaro")` basta. Nessuna gerarchia di eccezioni custom.
- **Test dove serve**: copri il Proximity Scoring e le pipeline LLM. Il resto: integration test leggeri.

> Se ti viene voglia di creare una classe `AbstractBaseServiceFactory`, fermati.

---

## 4. Convenzioni di sviluppo

### Commit
```
<tipo>(<scope>): <descrizione in italiano>

feat(roadmap): aggiunge ciclo di raffinamento con input utente
fix(auth): corregge scadenza refresh token
chore(deps): aggiorna azure-openai a 1.2.0
```

Tipi: `feat` · `fix` · `chore` · `docs` · `refactor` · `test`

### Branch
```
<iniziali-autore>/<descrizione-breve>
es: na/proximity-scoring
```

### File e cartelle
```
src/
  frontend/     # React SPA
  backend/      # Node.js REST API
    routes/     # Express routes — flat, nessun nesting profondo
    services/   # Logica di business
    llm/        # Pipeline LLM (pipeline1, pipeline2, pipeline3)
    db/         # Query PostgreSQL — SQL grezzo, nessun ORM
```

### Database
- **Nessun ORM** — SQL grezzo con `pg` (node-postgres). Le query sono leggibili e debuggabili.
- Migration con file SQL numerati in `src/backend/db/migrations/`.
- Nessun seed automatico in produzione.

### LLM
- I prompt sono file `.txt` o `.md` in `src/backend/llm/prompts/` — non inline nel codice.
- Ogni pipeline ha la propria funzione in `src/backend/llm/`.
- Lo streaming verso il client avviene via SSE (`text/event-stream`).

---

## 5. Cosa NON fare

- ❌ Non modificare `word/styles.xml`, `word/theme/`, `ppt/slideMasters/` — sono parti protette del template AGIC
- ❌ Non committare secrets, `.env`, chiavi API o connection string
- ❌ Non introdurre microservizi o code splitting architetturale senza discussione esplicita
- ❌ Non usare `any` in TypeScript senza un commento che spiega perché
- ❌ Non aprire PR su `main` senza aver fatto girare i test
