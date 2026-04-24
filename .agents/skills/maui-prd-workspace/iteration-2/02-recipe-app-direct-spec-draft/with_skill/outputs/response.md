## Piano breve

1. Il prompt è già sufficientemente definito, quindi non apro una discovery lunga.
2. Ti preparo subito la bozza di `docs/spec.md` con `TBD` minimi dove serve.
3. Tengo il documento sul livello PRD, utile per studenti e per il planning successivo.

## File da creare o modificare

- `docs/spec.md`.

## Implementazione richiesta

In questo contesto di valutazione non scrivo realmente il file: sotto trovi il contenuto previsto per `docs/spec.md`.

```md
# Specifica di Progetto - MealMate MAUI

## 1. Visione e contesto

### Problema da risolvere
L'utente vuole raccogliere ricette personali, organizzarle per categorie, ritrovarle velocemente e pianificare i pasti settimanali senza dipendere da account o servizi esterni nell'MVP.

### Obiettivo del progetto
Creare una app `.NET MAUI` Android-first per gestione ricette personali e piano pasti, con struttura compatibile con MVVM, Shell e documentazione didattica progressiva.

### Utenti target
- Studenti o utenti privati che vogliono organizzare ricette proprie.

## 2. Ambito MVP

### Flusso principale da supportare
L'utente crea o modifica una ricetta, la classifica, la cerca localmente e la assegna a uno o più pasti della settimana.

### Funzionalità obbligatorie
- Creazione, modifica e consultazione ricette personali.
- Categorie ricetta.
- Associazione foto a una ricetta.
- Ricerca locale per titolo o categoria.
- Piano pasti settimanale.

### Funzionalità opzionali future
- Lista della spesa generata automaticamente.
- Condivisione ricette.
- Sincronizzazione cloud.
- Suggerimenti automatici menu.

### Non-obiettivi
- Login nell'MVP.
- Collaborazione multiutente.
- Supporto desktop dedicato.
- Notifiche push nella prima versione.

## 3. Scenari d'uso principali

### Scenario 1
L'utente salva una nuova ricetta con foto e categoria per averla sempre disponibile nell'archivio personale.

### Scenario 2
L'utente cerca una ricetta già salvata e la inserisce nel piano pasti della settimana.

## 4. Requisiti funzionali

- FR-01: l'utente deve poter creare, modificare ed eliminare ricette personali.
- FR-02: ogni ricetta deve poter includere almeno titolo, categoria, ingredienti essenziali e istruzioni.
- FR-03: l'utente deve poter associare una foto a una ricetta.
- FR-04: l'utente deve poter eseguire una ricerca locale con risultati coerenti e stato vuoto esplicito.
- FR-05: l'utente deve poter assegnare ricette ai giorni della settimana nel piano pasti.

## 5. Epic, user stories e criteri di accettazione

### EPIC-01 - Archivio ricette personali

**Obiettivo:** permettere la raccolta strutturata di ricette personali.

**User stories:**
- Come utente, voglio salvare una ricetta così da consultarla in futuro.
- Come utente, voglio classificarla così da ritrovarla più facilmente.

**Criteri di accettazione:**
- [ ] Una nuova ricetta può essere salvata con i campi obbligatori minimi definiti.
- [ ] Se il salvataggio fallisce, la UI mostra un messaggio di errore comprensibile.
- [ ] Le ricette salvate restano disponibili tra riaperture dell'app.

### EPIC-02 - Ricerca locale

**Obiettivo:** trovare rapidamente ricette già archiviate.

**User stories:**
- Come utente, voglio cercare per nome o categoria così da trovare subito una ricetta.

**Criteri di accettazione:**
- [ ] Una ricerca senza risultati mostra uno stato empty esplicito.
- [ ] Durante il caricamento iniziale archivio o di grandi raccolte la UI mostra uno stato loading comprensibile.
- [ ] In caso di errore di accesso ai dati locali o foto non leggibile, la UI espone uno stato di errore chiaro.

### EPIC-03 - Piano pasti settimanale

**Obiettivo:** pianificare i pasti della settimana con ricette già salvate.

**User stories:**
- Come utente, voglio assegnare ricette ai giorni così da organizzare i pasti settimanali.

**Criteri di accettazione:**
- [ ] Ogni giorno della settimana può avere zero o più ricette associate secondo il modello scelto nel planning.
- [ ] L'utente vede chiaramente se un giorno non ha ancora pasti pianificati.

## 6. Requisiti non funzionali

### UX e stati UI
- I flussi di salvataggio e caricamento devono gestire loading, empty, error e success state quando applicabili.

### Prestazioni percepite
- L'apertura della lista ricette e la ricerca locale devono dare feedback immediato all'utente.

### Affidabilità e gestione errori
- Le operazioni locali non devono fallire in silenzio.

### Privacy e dati
- Nessun account utente nell'MVP.
- Dati e foto gestiti localmente sul dispositivo.

## 7. Vincoli tecnici di progetto

- App `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- Persistenza locale con `Preferences` e/o SQLite
- Android come target principale
- iOS opzionale e non prioritario nella prima fase

## 8. Metriche di successo

- L'utente salva una ricetta completa senza assistenza esterna.
- L'utente trova una ricetta esistente in pochi secondi tramite ricerca locale.
- Il piano pasti settimanale è compilabile senza ambiguità di stato.

## 9. Rischi, dipendenze e questioni aperte

### Rischi
- Gestione foto e persistenza potrebbero aumentare la complessità dell'MVP.

### Dipendenze
- Nessuna dipendenza remota obbligatoria nell'MVP.

### Questioni aperte o `TBD`
- `TBD`: definire se il piano pasti consente più ricette per singolo slot o una sola.

## 10. Passaggio al planning

Il passo successivo è derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md` a partire da questo PRD, preferibilmente tramite `prd-to-plan`.
```

## Rischi o punti da controllare

- Modello dati del piano pasti ancora da fissare.
- Gestione foto locali da tenere entro un MVP sostenibile.

## Test manuali suggeriti

- Verificare che ogni epic abbia confini chiari tra MVP e futuro.
- Controllare che il supporto iOS resti opzionale nei documenti successivi.
- Riesaminare che gli stati UI siano indicati nei flussi con lettura/salvataggio dati.
