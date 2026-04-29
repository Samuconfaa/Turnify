# Turnify — istruzioni per Claude Code

## Commit
- Non aggiungere mai la riga `Co-Authored-By` nei messaggi di commit.

## Regole MAUI
Per qualsiasi lavoro su file `.cs` o `.xaml` del progetto mobile, seguire sempre le regole definite in `.agents/skills/maui-expert/SKILL.md`, `docs/method/man-in-the-loop.md` e `AGENTS-md`.

## Prompt log
Alla fine di ogni messaggio ricevuto dall'utente che richiede un task significativo (nuova funzionalità, modifica architetturale, bugfix, generazione di codice), aggiungere una voce in `docs/prompt-log.md`.

Il formato è quello già in uso nel file (sezioni `### Data`, `### Strumento`, `### Obiettivo`, `### Prompt`, `### Output utile`, `### Decisione presa`, `### Motivazione`). Il numero della voce deve essere progressivo rispetto all'ultima presente nel file.

**Come compilare ogni campo:**
- `### Prompt`: rielabora la richiesta dell'utente in linguaggio tecnico preciso, come se fosse un prompt da manuale — nomi di file, interfacce, endpoint, pattern esatti. Non è una citazione verbatim, è una versione tecnica sintetica.
- `### Output utile`: descrivi cosa è stato generato/modificato (file, righe, pattern principali). Se il task non è ancora completato al momento della scrittura, usa "In corso".
- `### Decisione presa`: `Accettato integralmente` / `Modificato` / `Accettato con fix minori` / `In corso`.
- `### Motivazione`: perché è stata presa quella decisione (evidenza dal codice, fix successivi, conferma utente).
