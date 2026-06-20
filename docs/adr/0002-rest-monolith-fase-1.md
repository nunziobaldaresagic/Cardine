# Architettura monolitica REST per la Fase 1

Cardine è sviluppato come monolite REST API per il MVP invece di microservizi. I confini tra i domini (catalogo, gap analysis, LLM pipeline, roadmap) non sono ancora validati dall'uso reale: scomporli in servizi separati prima di conoscere le linee di frattura naturali avrebbe prodotto microservizi mal tagliati e costosi da rifattorizzare. Il monolite permette di muoversi velocemente, validare il prodotto e identificare i confini reali. La separazione in servizi è pianificata per la Fase 2, quando il comportamento del sistema sarà stabile.
