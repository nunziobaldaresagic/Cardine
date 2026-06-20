# PostgreSQL senza vector database per il Proximity Scoring

# PostgreSQL con pg_trgm per il matching competenze — Elasticsearch valutato e scartato

Il Proximity Score tra Profilo Competenze e Ruoli è calcolato con un algoritmo di matching ponderato in application code (competenze soddisfatte / competenze richieste, con pesi) più una valutazione qualitativa LLM, invece di un vector database (pgvector, Pinecone). Per il MVP il catalogo di ruoli è piccolo e definito: la ricerca semantica vettoriale non aggiunge precisione significativa rispetto al matching strutturato su un set controllato di competenze.

**Elasticsearch è stato valutato come alternativa** per il fuzzy matching sui nomi di competenza (es. `"React"` ≈ `"ReactJS"` ≈ `"react.js"`). È stato scartato perché richiederebbe un secondo database accanto a PostgreSQL (i dati relazionali — Tenant, Dipendente, Roadmap — non possono risiedere in Elasticsearch), aggiungendo complessità operativa e costi di cluster Azure senza alcun vantaggio prestazionale per il volume del MVP (<20 utenti, catalogo bounded).

Il fuzzy matching sulle competenze è risolto con l'estensione **`pg_trgm`** già inclusa in PostgreSQL: trigram similarity index su `competenza.nome`, zero infrastruttura aggiuntiva. Da rivalutare se il catalogo supera ~50.000 competenze distinte e le query superano i 200ms di latenza.
