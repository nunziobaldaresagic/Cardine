# Cardine

Cardine è una piattaforma B2B di career counseling che aiuta i dipendenti a orientarsi nel percorso professionale interno all'azienda, mappando le loro competenze attuali contro i ruoli reali dell'organizzazione e generando percorsi di crescita concreti.

## Language

### Attori

**Dipendente**:
La persona che utilizza Cardine per esplorare il proprio percorso di crescita professionale all'interno dell'azienda.
_Avoid_: Utente, collaboratore, employee

**Career Counselor**:
La figura aziendale che accompagna il Dipendente nel percorso professionale. Usa Cardine per preparare e condurre i colloqui di sviluppo. Non coincide con l'HR né con il responsabile diretto.
_Avoid_: Coach, mentor, referente HR

**HR Admin**:
Il responsabile della configurazione di Cardine all'interno di un Tenant. Gestisce il Catalogo e i profili dei Dipendenti.
_Avoid_: Amministratore, HR manager

### Organizzazione

**Tenant**:
Un'azienda cliente che utilizza Cardine. Ogni Tenant ha il proprio Catalogo, i propri Ruoli e i propri Dipendenti, isolati dagli altri Tenant.
_Avoid_: Cliente, organizzazione, azienda

**Livello**:
Il grado professionale assegnato a un Dipendente dall'HR Admin (es. junior, mid, senior, lead). Determina quali Ruoli del Catalogo sono candidabili per quel Dipendente.
_Avoid_: Seniority, grado, fascia

**Ruolo**:
Una posizione lavorativa definita nel Catalogo di un Tenant, caratterizzata da un insieme di Competenze richieste con i relativi pesi.
_Avoid_: Job title, posizione, mansione

**Catalogo**:
L'insieme dei Ruoli e delle Competenze configurati per un Tenant. Cardine fornisce un catalogo base che ogni Tenant può personalizzare.
_Avoid_: Libreria, repository di ruoli

### Competenze e gap

**Competenza**:
Un'abilità, un'area di conoscenza o un attributo comportamentale associato a uno o più Ruoli nel Catalogo.
_Avoid_: Skill, capacità, abilità

**Profilo Competenze**:
L'insieme delle Competenze estratte dal profilo del Dipendente tramite LLM, a partire dai dati importati dalla piattaforma interna aziendale tramite connettore. Per il MVP i profili sono pre-caricati. Rappresenta il punto di partenza del Gap Analysis.
_Avoid_: CV analizzato, competenze del dipendente

**Proximity Score**:
Un valore percentuale che indica quanto il Profilo Competenze di un Dipendente è vicino ai requisiti di un determinato Ruolo.
_Avoid_: Punteggio, match score, percentuale di compatibilità

**Gap**:
La differenza tra il Profilo Competenze di un Dipendente e le Competenze richieste da un Ruolo Target.
_Avoid_: Delta, mancanze, lacune

### Percorso di crescita

**Ruolo Target**:
Il Ruolo verso cui un Dipendente sceglie di orientare il proprio percorso di crescita, selezionato tra quelli proposti da Cardine in base al Proximity Score.
_Avoid_: Obiettivo, ruolo desiderato, destinazione

**Roadmap**:
Il piano di crescita strutturato generato da Cardine per un Dipendente verso un Ruolo Target. Include corsi, certificazioni e milestone operative con sequenza temporale.
_Avoid_: Piano di sviluppo, percorso formativo, learning path

**Ciclo di Raffinamento**:
Il processo iterativo in cui il Dipendente, dopo aver ricevuto una proposta di Roadmap, fornisce un input in linguaggio naturale e ottiene una nuova proposta ricalibrata. Il ciclo si chiude con la conferma della Roadmap da parte del Dipendente.
_Avoid_: Feedback loop, iterazione, revisione

## Example dialogue

> **Dipendente**: Ho caricato il mio CV. Cosa succede adesso?
>
> **Career Counselor**: Cardine ha estratto il tuo Profilo Competenze e lo ha confrontato con tutti i Ruoli del Catalogo compatibili con il tuo Livello. Sei al 78% dal Ruolo Target "Team Lead" e al 61% da "Solution Architect".
>
> **Dipendente**: Preferisco puntare a Team Lead. Cosa mi manca?
>
> **Career Counselor**: Il Gap è su tre Competenze: gestione del conflitto, pianificazione di progetto e stakeholder management. La Roadmap proposta prevede un corso Agile, una certificazione PMP e due milestone operative nei prossimi 6 mesi.
>
> **Dipendente**: Agile lo conosco già, posso saltarlo?
>
> **Career Counselor**: Inserisci questa nota nel Ciclo di Raffinamento — Cardine genererà una nuova Roadmap escludendo quell'area e rafforzando le altre due.
