# Selezione documenti

## Piano breve

Chiudere l'iterazione aggiornando solo la documentazione che registra avanzamento, verifiche e prompt rilevanti, senza allargare scope o requisiti.

## File da creare o modificare

- `docs/iterations/it-02.md` oppure un nome coerente con la convenzione già usata nel repository
- `docs/test-matrix.md`
- `docs/prompt-log.md`
- `docs/spec.md` solo come aggiornamento opzionale, non come obbligo

## Implementazione richiesta

- `docs/iterations/it-02.md`: da aggiornare sicuramente, perché avete completato una iterazione significativa. Qui vanno registrati obiettivo, file introdotti (`SearchViewModel`, `SearchPage`, `BookService`), prompt principali usati, test eseguiti, eventuali problemi e correzioni, ed esito finale.
- `docs/test-matrix.md`: da aggiornare sicuramente, perché ci sono nuove evidenze di verifica manuale. Il workflow richiede di tracciare i test eseguiti e i casi coperti; qui vanno quindi riportati almeno input vuoto, timeout, loading state visibile e lista vuota mostrata.
- `docs/prompt-log.md`: da aggiornare sicuramente, perché due prompt hanno influito materialmente sul risultato: uno per ottenere il service e uno per correggere il ViewModel. Il workflow chiede di conservarli quando un prompt orienta struttura o correzioni accettate.
- `docs/spec.md`: non è necessario aggiornarlo come parte obbligatoria di questa chiusura, perché i requisiti funzionali non sono cambiati. Può essere aggiornato solo se il chiarimento sugli stati UI non era ancora scritto e volete renderlo esplicito come comportamento atteso o criterio di accettazione.
- `docs/plan.md`: non serve aggiornarlo, perché dal prompt non risultano cambi di roadmap, dipendenze o sequenza delle iterazioni.

## Rischi o punti da controllare

- Nel repository attuale esiste già `docs/iterations/`, ma `docs/test-matrix.md` e `docs/prompt-log.md` potrebbero dover essere creati da zero.
- Conviene usare path repository-relative e mantenere una naming convention coerente con `docs/iterations/it-01-maui-expert.md`.
- Se il team considera gli stati UI chiariti come parte della specifica verificabile, allora `docs/spec.md` passa da opzionale a consigliato.

## Test manuali suggeriti

- Verificare che i documenti riportino gli stessi quattro test manuali già eseguiti, senza aggiungerne di non validati.
- Controllare che nel log iterazione siano esplicitati sia il prompt per `BookService` sia quello per la correzione di `SearchViewModel`.
- Controllare che `docs/spec.md`, se non aggiornato, non venga citato come modificato nell'iterazione.
