# Cardine — Pitch per la Giuria / Documento Descrittivo

> **Progetto**: Cardine  
> **Tagline**: *"La mappa del tuo percorso professionale"*  
> **Tipologia**: Piattaforma B2B SaaS di Career Counseling potenziata da AI  
> **Ambito**: HR Tech / Employee Retention / Professional Development

---

## 1. Il Problema: Il costo silenzioso della perdita dei talenti

Nelle aziende moderne, il turnover volontario è una delle voci di costo più pesanti e sottovalutate. La ricerca di mercato dimostra che **oltre il 60% dei dipendenti che cambiano lavoro lo fa per "mancanza di opportunità di crescita interna"**.
*   **Perdita economica**: Sostituire una risorsa qualificata costa all'azienda in media **tra i 30.000€ e i 40.000€** (costi di recruitment, onboarding, calo di produttività e perdita di know-how).
*   **Inefficienza dell'HR**: I colloqui di sviluppo professionale sono condotti manualmente, in modo frammentato, spesso basati su fogli di calcolo o valutazioni soggettive, rendendo il processo lento, non ripetibile e difficile da scalare.
*   **Paralisi del dipendente**: Davanti alla classica domanda *"Dove ti vedi tra 5 anni?"*, i dipendenti si sentono smarriti. I cataloghi di corsi aziendali (LMS) sono giungle di migliaia di corsi non contestualizzati, che generano paralisi decisionale.

---

## 2. La Soluzione: Cardine

**Cardine** è una piattaforma B2B di career counseling che aiuta i dipendenti a orientarsi nel proprio percorso professionale all'interno dell'organizzazione, mappando le competenze in modo oggettivo e tracciando una roadmap di crescita personalizzata.

```
       [PROFILO DIPENDENTE] (Importazione / CV)
               │
               ▼
   [ESTRAZIONE COMPETENZE] (Tramite Few-Shot LLM)
               │
               ▼
     [PROXIMITY SCORING]  (Algoritmo + LLM) -> "Sei al 78% da Team Lead Frontend"
               │
               ▼
     [ROADMAP GENERATION] (AI Streaming via SSE - Corsi, Milestone, Certificazioni)
               │
               ▼
   [CICLO DI RAFFINAMENTO] (Input naturale del dipendente per personalizzare)
               │
               ▼
     [CONFERMA ROADMAP]   (Condivisione automatica con il Career Counselor)
```

### Come funziona l'esperienza:
1.  **Mappatura Istantanea**: Il dipendente importa il proprio profilo (CV o dati aziendali). L'AI estrae le competenze e calcola un **Proximity Score** percentuale rispetto ai ruoli del Catalogo aziendale compatibili col suo livello professionale.
2.  **Visualizzazione del Gap**: Il dipendente vede a colpo d'occhio dove si trova rispetto al suo obiettivo (es. *"Sei al 78% da Team Lead Frontend, ti mancano 3 competenze"*).
3.  **Roadmap in Streaming**: Selezionato il Ruolo Target, l'AI genera in tempo reale (streaming via Server-Sent Events) una roadmap strutturata con corsi, certificazioni e milestone operative (es. condurre demo o gestire conflitti).
4.  **Co-creazione e Raffinamento**: Il dipendente può dialogare con l'AI in linguaggio naturale per raffinare il percorso (*"Conosco già Agile, toglilo"*) prima di confermarlo.
5.  **Counseling di Valore**: Una volta confermata, la roadmap diventa la base di discussione per il Career Counselor aziendale nei colloqui di sviluppo periodici.

---

## 3. Innovazione e Architettura Tecnologica

Il team ha sviluppato Cardine ponendo l'accento su **scalabilità applicativa**, **efficienza dei costi** e **sicurezza enterprise**:

*   **Azure OpenAI (GPT-4o)**: Garantisce modelli LLM all'avanguardia con contratti enterprise conformi al GDPR. I dati dei dipendenti rimangono isolati nella regione europea e non vengono utilizzati per l'addestramento dei modelli.
*   **Fuzzy Matching Ottimizzato su PostgreSQL**: Invece di introdurre la complessità operativa e i costi di un Vector Database o di cluster Elasticsearch dedicati per l'MVP, il matching delle competenze è stato implementato combinando un algoritmo in codice applicativo con l'estensione **`pg_trgm`** integrata in PostgreSQL. Questa scelta riduce drasticamente l'infrastruttura iniziale, garantendo ottime performance fino a 50.000 competenze distinte.
*   **Streaming SSE (Server-Sent Events)**: La generazione della roadmap avviene in streaming JSON strutturato, offrendo un'esperienza utente interattiva ("AI che scrive in tempo reale") senza sovraccaricare il frontend.
*   **Sicurezza Network Enterprise**: PostgreSQL, Key Vault e OpenAI sono isolati dalla rete pubblica tramite **Azure Private Endpoints** e vi si accede solo dall'App Service backend tramite **VNet Integration outbound** (SKU Premium P2v3), garantendo la massima protezione da attacchi esterni.

---

## 4. Perché Cardine vince: Punti di Forza Unici

1.  **Crescita Interna vs Mobilità Esterna**: La maggior parte delle piattaforme HR si focalizza sul recruitment esterno o sul monitoraggio delle performance. Cardine si focalizza esclusivamente sulla crescita e la retention interna, riducendo i costi di recruiting delle aziende.
2.  **L'effetto IKEA del percorso di crescita**: Consentendo il *Ciclo di Raffinamento* in linguaggio naturale, il dipendente partecipa attivamente alla definizione del suo percorso. Psicologicamente, questo aumenta il commitment (impegno) del dipendente nel portare a termine la formazione.
3.  **Goal-Gradient Motivation**: Visualizzare la vicinanza percentuale a un ruolo (es. 78%) spinge il dipendente a colmare l'ultimo miglio, riducendo l'abbandono tipico dei corsi di formazione generici non finalizzati a un ruolo.
4.  **Rispetto dei Ruoli Aziendali**: Cardine non sostituisce il Career Counselor umano, ma elimina il lavoro burocratico di mapping e preparazione, consentendo al counselor di concentrarsi sulla relazione e sul supporto emotivo/professionale.

---

## 5. Viabilità Economica e Modello B2B

*   **Sviluppo MVP (Fase 1)**: Il piano di lavoro prevede un MVP completo rilasciato in **10 settimane** per un investimento a forfait fisso di **110.000€**, operato da un team agile bilanciato (Tech Lead, due Developer, Designer, PM e Tester).
*   **Modello di Business**: SaaS B2B con pricing ricorrente mensile a utente (es. **€5/utente/mese** nel piano Professional).
*   **Ritorno sull'Investimento (ROI) per il cliente**: Per un'azienda con 200 dipendenti, il costo di Cardine è di circa 12.000€ all'anno. **Se Cardine riesce a trattenere anche solo un singolo dipendente senior all'anno che altrimenti si sarebbe dimesso (risparmio di ~35.000€), l'investimento sulla piattaforma si ripaga da solo quasi 3 volte.**
