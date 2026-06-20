# Cardine — Design Specification for Google Stitch

## App Overview

**Cardine** is a B2B web app for internal career counseling. It helps employees understand their current skill profile, see which internal company roles they are closest to reaching, and generate a concrete growth roadmap powered by AI.

**Platform**: Web app (desktop-first, responsive). No mobile native app for this version.
**Users**: Three roles — Employee, Career Counselor, HR Admin.
**Tone**: Professional, empowering, clean. Not clinical or bureaucratic. Think "LinkedIn meets a smart career advisor."
**Language**: Italian (all UI labels, placeholder text, and copy should be in Italian).

---

## Brand Direction

**Name**: Cardine
**Tagline**: "La mappa del tuo percorso professionale"

**Color palette suggestion**:
- Primary: deep teal `#1A6B72` — conveys trust, growth, direction
- Accent: warm amber `#F0A500` — highlights key metrics and CTAs
- Background: off-white `#F7F8FA`
- Text primary: `#1A1A2E`
- Text secondary: `#6B7280`
- Success/positive: `#22C55E`
- Cards/surfaces: `#FFFFFF` with subtle shadow

**Typography**: Inter or similar clean sans-serif. Headings bold, body regular.

**Visual motif**: Circular progress indicators for Proximity Score. Clean cards with subtle left-border accents for role items.

---

## Screens to Design

Design **5 core screens**, all desktop (1440px wide):

---

### Screen 1 — Employee Dashboard (Home)

**URL**: `/dashboard`
**User**: Dipendente (Employee)

**Purpose**: Main landing screen after login. Shows the employee's skill profile and the proximity map — the key "wow" moment of the product.

**Layout**:
- Top navbar: Cardine logo (left) + employee name + avatar (right) + notification bell
- Left sidebar (220px): navigation items — Dashboard, La mia Roadmap, Profilo, Esci
- Main content area:

**Main content — two sections:**

**Top section — "Il tuo profilo" (left ~40% width)**:
- Employee name: "Marco Rossi"
- Current level badge: "Mid-Level Developer"
- Department: "Engineering"
- Small skill cloud or horizontal tag list showing 6-8 extracted competencies, e.g.:
  `React` `TypeScript` `REST API` `PostgreSQL` `Agile` `Git` `Node.js`
- Each competency as a soft pill/chip in teal

**Top section — "Ruoli più vicini a te" (right ~60% width)**:
- Section title: "Ruoli più vicini a te" with subtitle "Basato sul tuo profilo attuale"
- 3-4 role cards displayed in a vertical list (or 2-column grid), each card showing:
  - Role name (bold): e.g. "Team Lead Frontend"
  - Department tag: "Engineering"
  - Proximity Score as a large circular progress ring with percentage inside: "78%"
  - Ring color: green if >70%, amber if 50-70%, light gray if <50%
  - Gap summary: "3 competenze mancanti"
  - CTA button: "Vedi percorso →" (teal, outlined)
- Cards ordered by proximity score descending
- Example roles:
  - "Team Lead Frontend" — 78% — 3 competenze mancanti
  - "Solution Architect" — 61% — 5 competenze mancanti
  - "Engineering Manager" — 45% — 7 competenze mancanti

**Bottom section — "La tua Roadmap attiva"**:
- If roadmap confirmed: compact horizontal timeline showing 3-4 milestones with status indicators (done, in progress, upcoming)
- If no roadmap yet: empty state with CTA "Genera la tua prima Roadmap"

---

### Screen 2 — Gap Detail & Role Selection

**URL**: `/ruolo/team-lead-frontend`
**User**: Dipendente

**Purpose**: Clicked from a role card on Screen 1. Shows the full gap analysis for a specific target role and lets the employee start roadmap generation.

**Layout**:
- Breadcrumb: Dashboard > Team Lead Frontend
- Two-column layout:

**Left column (55%)**:
- Role title: "Team Lead Frontend" (H1, bold)
- Department + Level badge
- Large Proximity Score display: huge circular ring (120px) with "78%" inside, label "Proximity Score" below
- Section: "Competenze che già possiedi" — green checkmark list:
  - ✓ React (Advanced)
  - ✓ TypeScript (Advanced)
  - ✓ REST API Design (Intermediate)
  - ✓ Git (Advanced)
  - ✓ Agile/Scrum (Intermediate)
- Section: "Competenze da sviluppare" — amber/warning list with gap pills:
  - ◯ Gestione del Conflitto (mancante)
  - ◯ Pianificazione di Progetto (mancante)
  - ◯ Stakeholder Management (mancante)

**Right column (45%)**:
- Card: "Cosa prevede questo ruolo"
  - Brief role description (2-3 lines)
  - Key responsibilities as bullet list
- Big CTA button (full width, primary teal): "Genera la mia Roadmap per questo ruolo"
- Below CTA: small text "La roadmap sarà generata in tempo reale dall'AI e potrai personalizzarla"

---

### Screen 3 — Roadmap Generation (AI Streaming)

**URL**: `/roadmap/genera`
**User**: Dipendente

**Purpose**: The "wow" screen. Shows the AI generating the roadmap in real time with a streaming text effect. This is the most important screen for the demo.

**Layout**:
- Centered content area (max-width 860px, centered)
- Top: "Generazione Roadmap in corso..." as H2 with a subtle animated pulse/spinner
- Role target pill: "Team Lead Frontend" with proximity ring (78%)

**AI Generation Area** (main card, white, slightly elevated shadow):
- Top of card: small animated "AI is writing..." indicator (three dots animation or subtle typewriter cursor)
- Content streams in progressively, structured as:

  **"La tua Roadmap verso Team Lead Frontend"** (bold heading)

  *"Ecco il percorso personalizzato basato sul tuo profilo attuale. Durata stimata: 6 mesi."*

  **Step 1 — Gestione del Conflitto** (amber badge "Mese 1-2")
  - Corso: "Conflict Management for Tech Teams" — Coursera — 8 ore
  - Milestone: Gestire autonomamente un disaccordo tecnico in team e documentare la risoluzione

  **Step 2 — Pianificazione di Progetto** (amber badge "Mese 2-4")
  - Corso: "Project Management Fundamentals" — LinkedIn Learning — 12 ore
  - Certificazione: PMP Foundation (opzionale)
  - Milestone: Pianificare e consegnare uno sprint completo con ownership

  **Step 3 — Stakeholder Management** (amber badge "Mese 4-6")
  - Corso: "Communicating with Executive Stakeholders" — interno
  - Milestone: Condurre una demo di fine sprint con il cliente/stakeholder senior

- While generating: text appears progressively (typewriter effect simulation in the mockup — show partial text with cursor)

**Bottom of screen** (appears after generation completes):
- Text input area: placeholder "Vuoi personalizzare la roadmap? Es: 'conosco già Agile', 'ho solo 3 mesi disponibili'..."
- Button: "Rigenera con questo input" (secondary, outlined)
- OR: Big CTA: "Conferma questa Roadmap" (primary teal, large)

---

### Screen 4 — Confirmed Roadmap View

**URL**: `/roadmap/attiva`
**User**: Dipendente

**Purpose**: Shows the confirmed roadmap as a visual timeline the employee can track.

**Layout**:
- Header: "La mia Roadmap — Team Lead Frontend" + confirmed date badge + "78% → obiettivo: 100%"
- Horizontal progress bar: "Inizio" ... [milestone 1] ... [milestone 2] ... [milestone 3] ... "Obiettivo"

**Timeline cards** (vertical stack, each card representing a step):
Each card has:
- Left side: step number in colored circle (teal for completed, amber for in progress, gray for upcoming)
- Month range badge
- Step title (bold)
- Competenza target tag
- List of actions (course + milestone)
- Status indicator: "Completato ✓" / "In corso" / "Non iniziato"
- For in-progress steps: a "Segna come completato" button

**Bottom**: "Condividi con il tuo Career Counselor" button (secondary) + "Rigenera roadmap" link (text link, small)

---

### Screen 5 — Career Counselor Dashboard

**URL**: `/counselor/dashboard`
**User**: Career Counselor

**Purpose**: Overview of all employees in the counselor's group, with their progress.

**Layout**:
- Top navbar: same as Employee but with "Career Counselor" role badge
- Page title: "Il mio Gruppo" + count badge "8 persone"
- Filter bar: search input + filter by Level + filter by "Roadmap attiva / non attiva"

**Employee table/list** (each row is a person):
Each row shows:
  - Avatar + Name: "Marco Rossi"
  - Level: "Mid-Level Developer" (pill)
  - Ruolo Target: "Team Lead Frontend" (if roadmap active) or "— Nessun obiettivo —"
  - Proximity Score: small ring indicator + percentage
  - Roadmap status: "Attiva" (green dot) / "Non confermata" (amber dot) / "Nessuna" (gray)
  - Last activity: "3 giorni fa"
  - Action: "Vedi dettaglio →"

**Detail panel** (slide-in from right when "Vedi dettaglio" is clicked):
- Employee name + level
- Skill tags
- Active roadmap summary (compact 3-step timeline)
- "Prossimo colloquio" date placeholder
- Note field: "Note del counselor" (free text)

---

## Component Inventory (reusable)

- **ProximityRing**: circular SVG progress ring with percentage. Size variants: sm (40px), md (80px), lg (120px)
- **SkillChip**: pill/tag for competency name. Variants: possessed (teal bg), missing (amber outline), neutral (gray)
- **RoleCard**: card component with role name, department, ProximityRing (md), gap count, CTA
- **RoadmapStep**: card for a single roadmap step with status indicator, course list, milestone
- **StreamingText**: text container with typewriter animation for AI generation screen
- **LevelBadge**: pill showing employee level (Junior / Mid / Senior / Lead)
- **StatusDot**: colored dot for roadmap status (active/pending/none)

---

## Navigation Structure

```
/login                    — Login page (not in scope for mockup)
/dashboard                — Screen 1: Employee home
/ruolo/:id                — Screen 2: Gap detail
/roadmap/genera           — Screen 3: AI generation
/roadmap/attiva           — Screen 4: Confirmed roadmap
/counselor/dashboard      — Screen 5: Counselor overview
/hr/catalogo              — HR Admin (not in scope for mockup)
```

---

## Sample Data to Use in Mockups

**Employee**: Marco Rossi | Mid-Level Developer | Engineering
**Competencies**: React, TypeScript, REST API Design, PostgreSQL, Git, Agile/Scrum, Node.js

**Roles in proximity map**:
1. Team Lead Frontend — 78% — Gap: Gestione Conflitto, Pianificazione Progetto, Stakeholder Management
2. Solution Architect — 61% — Gap: System Design, Cloud Architecture, Business Requirements, API Governance, Performance Engineering
3. Engineering Manager — 45% — Gap: (7 competenze)

**Counselor**: Giulia Bianchi | manages 8 people

**Employees in counselor group**:
- Marco Rossi | Mid-Level | Team Lead Frontend | 78% | Roadmap attiva
- Sara Conti | Senior Developer | Solution Architect | 61% | Non confermata
- Luca Ferrari | Junior Developer | Mid-Level Developer | 52% | Nessuna
- Anna Greco | Senior Developer | Engineering Manager | 55% | Attiva
- Paolo Ricci | Mid-Level | Team Lead Backend | 71% | Attiva

---

## Design Notes for Stitch

1. **The Proximity Ring is the hero element** of this product. Make it visually prominent and satisfying to look at. Use gradient strokes (teal to green for high scores).

2. **Screen 3 (AI Generation) must feel alive** — use animation hints in the mockup (blinking cursor, partially filled content) to convey the real-time generation feel.

3. **Cards should breathe** — generous padding (24px+), subtle shadows, rounded corners (12px).

4. **No information overload** — this is a tool people use periodically, not daily. Keep each screen focused on one primary action.

5. **Mobile responsiveness** — show how the Employee Dashboard collapses on tablet (1024px): sidebar becomes bottom nav, proximity map becomes single column.
