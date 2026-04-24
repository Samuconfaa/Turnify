## Piano breve

1. Tengo separata la fase di specifica dalla fase di implementazione.
2. Ti preparo il PRD iniziale della app film.
3. Ti indico il passaggio corretto successivo nel workflow, senza saltare direttamente al codice.

## File da creare o modificare

- `docs/spec.md`.

## Implementazione richiesta

Non implemento subito `SearchPage`, `SearchViewModel` o il service REST, perché in questo workflow sono passaggi successivi.

- Il PRD definisce cosa deve fare il progetto e con quali confini.
- Il planning traduce quel PRD in documenti come `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md`.
- L'implementazione arriva solo dopo, quando i requisiti e i criteri di accettazione sono abbastanza chiari da evitare codice prematuro o scope creep.

Per non lasciarti fermo, sotto trovi una prima bozza di `docs/spec.md`.

```md
# Specifica di Progetto - Movie Search MAUI

## 1. Visione e contesto

### Problema da risolvere
L'utente vuole cercare film e consultarne i dettagli in una app mobile semplice, con una base documentale adatta a un percorso didattico controllato.

### Obiettivo del progetto
Definire un MVP di app `.NET MAUI` per ricerca film e dettaglio, con requisiti abbastanza chiari da guidare planning e implementazione successive.

### Utenti target
- Utenti che vogliono cercare film rapidamente da mobile.

## 2. Ambito MVP

### Flusso principale da supportare
Ricerca film -> risultati -> dettaglio film.

### Funzionalità obbligatorie
- Ricerca film tramite query.
- Visualizzazione risultati.
- Apertura dettaglio film.

### Funzionalità opzionali future
- Preferiti.
- Filtri avanzati.
- Cronologia ricerche.

### Non-obiettivi
- Implementazione del codice applicativo in questa fase.
- Auth utente nell'MVP.

## 3. Requisiti funzionali

- FR-01: l'utente deve poter inserire una query di ricerca.
- FR-02: il sistema deve mostrare risultati, empty state, loading state ed error state.
- FR-03: l'utente deve poter aprire il dettaglio di un film dalla lista risultati.

## 4. Epic, user stories e criteri di accettazione

### EPIC-01 - Ricerca film

**User stories:**
- Come utente, voglio cercare un film così da trovarne rapidamente i dettagli.

**Criteri di accettazione:**
- [ ] La ricerca produce un feedback visibile durante il caricamento.
- [ ] Se non ci sono risultati, la UI mostra uno stato empty esplicito.
- [ ] Se il servizio remoto fallisce, la UI mostra un errore comprensibile.

## 5. Vincoli tecnici di progetto

- `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- `HttpClient`
- `System.Text.Json`
- Android target principale

## 6. Questioni aperte o `TBD`

- `TBD`: confermare fonte dati film.
- `TBD`: confermare se il dettaglio deve includere trailer o solo metadati base.

## 7. Passaggio al planning

Una volta approvato il PRD, il passo successivo è derivare:

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

Preferibilmente tramite `prd-to-plan`. Se `prd-to-plan` non è disponibile, questi documenti vanno comunque definiti prima di passare a `SearchPage`, `SearchViewModel` e al service REST.
```

## Rischi o punti da controllare

- Fonte dati film ancora non esplicitata.
- Rischio di partire dal codice prima di aver fissato acceptance criteria e scope.

## Test manuali suggeriti

- Verificare che il PRD resti indipendente dal dettaglio implementativo.
- Confermare le informazioni minime attese nella schermata dettaglio prima del planning.
