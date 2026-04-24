## Piano breve

1. Il prompt è già ben definito, quindi evito una discovery lunga.
2. Ti faccio solo 2 chiarimenti mirati che possono influenzare il PRD.
3. Ti lascio subito la bozza completa di `docs/spec.md` con `TBD` residui espliciti.

## File da creare o modificare

- `docs/spec.md`.

## Implementazione richiesta

Due chiarimenti mirati, senza bloccare la bozza:

1. I contatti degli alloggi devono includere solo informazioni consultabili (telefono/email/link) oppure anche azioni dirette come chiamata o apertura mappa?
2. Vuoi che i preferiti locali siano solo una lista salvata oppure anche con note personali dell'utente? Se non rispondi, assumo lista semplice.

Di seguito la bozza prevista per `docs/spec.md`.

```md
# Specifica di Progetto - Erasmus Housing Finder

## 1. Visione e contesto

### Problema da risolvere
Gli studenti Erasmus hanno bisogno di trovare rapidamente alloggi disponibili, confrontarne i dettagli essenziali e salvare quelli interessanti senza doversi registrare o dipendere da flussi troppo complessi.

### Obiettivo del progetto
Realizzare una app `.NET MAUI` Android-first per ricerca alloggi, consultazione dettagli con contatti e gestione preferiti locali, con documentazione abbastanza chiara da guidare iterazioni successive con un agente AI.

### Utenti target
- Studenti Erasmus in cerca di alloggio temporaneo.

## 2. Ambito MVP

### Flusso principale da supportare
Lo studente cerca alloggi da API pubblica, visualizza risultati, apre il dettaglio di un annuncio e salva gli annunci rilevanti nei preferiti locali.

### Funzionalità obbligatorie
- Ricerca alloggi tramite dati remoti.
- Lista risultati con informazioni sintetiche.
- Schermata dettaglio con contatti principali.
- Gestione preferiti locali.

### Funzionalità opzionali future
- Filtri avanzati.
- Mappa interattiva.
- Note personali sui preferiti.
- Condivisione annuncio.

### Non-obiettivi
- Login nell'MVP.
- Chat con proprietari.
- Pagamenti o prenotazioni in-app.
- Supporto iOS completo come obiettivo primario.

## 3. Scenari d'uso principali

### Scenario 1
Lo studente cerca una città o un'area, consulta gli annunci e seleziona quelli più interessanti.

### Scenario 2
Lo studente apre il dettaglio di un alloggio per verificare prezzo, posizione e contatti.

### Scenario 3
Lo studente salva alcuni annunci nei preferiti per confrontarli più tardi.

## 4. Requisiti funzionali

- FR-01: l'utente deve poter eseguire una ricerca di alloggi tramite API pubblica.
- FR-02: il sistema deve mostrare lista risultati, empty state, loading state, success state ed error state in modo esplicito.
- FR-03: l'utente deve poter aprire il dettaglio di un annuncio dalla lista risultati.
- FR-04: il dettaglio deve esporre contatti e attributi essenziali dell'alloggio.
- FR-05: l'utente deve poter aggiungere e rimuovere annunci dai preferiti locali.

## 5. Epic, user stories e criteri di accettazione

### EPIC-01 - Ricerca e consultazione annunci

**Obiettivo:** aiutare lo studente a trovare e valutare rapidamente alloggi pertinenti.

**User stories:**
- Come studente Erasmus, voglio cercare alloggi così da trovare opzioni compatibili con le mie esigenze.
- Come studente Erasmus, voglio vedere i dettagli di un annuncio così da capire se vale la pena contattare il referente.

**Criteri di accettazione:**
- [ ] Dopo l'invio di una query, la UI mostra subito un indicatore di caricamento.
- [ ] Se non ci sono risultati, l'utente vede uno stato empty esplicito e non una pagina vuota.
- [ ] Se l'API fallisce o restituisce dati non validi, l'utente vede un messaggio di errore chiaro e può riprovare.
- [ ] Il dettaglio è raggiungibile dalla lista risultati in massimo 2 tap.

### EPIC-02 - Preferiti locali

**Obiettivo:** permettere allo studente di confrontare annunci rilevanti nel tempo.

**User stories:**
- Come studente Erasmus, voglio salvare i migliori annunci così da ritrovarli facilmente.

**Criteri di accettazione:**
- [ ] L'utente può aggiungere o rimuovere un annuncio dai preferiti senza ambiguità sullo stato corrente.
- [ ] I preferiti restano disponibili dopo la riapertura dell'app.
- [ ] Se la lista preferiti è vuota, l'utente vede uno stato empty dedicato.

## 6. Requisiti non funzionali

### UX e stati UI
- Ogni flusso con caricamento dati remoti o lettura preferiti locali deve esporre loading, empty, error e success state.

### Prestazioni percepite
- La ricerca deve fornire feedback visivo immediato.

### Affidabilità e gestione errori
- Errori rete e parsing non devono restare silenziosi.

### Privacy e dati
- Nessun login nell'MVP.
- I preferiti locali devono memorizzare solo i dati necessari al recupero dell'annuncio salvato.

## 7. Vincoli tecnici di progetto

- App `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- Chiamate remote asincrone con `HttpClient`
- Parsing con `System.Text.Json`
- Preferiti locali con `Preferences` e/o SQLite
- Android come target principale
- iOS opzionale

## 8. Metriche di successo

- Lo studente completa ricerca -> dettaglio -> preferito in modo comprensibile senza tutorial.
- Gli errori API sono sempre visibili e gestibili.
- Il PRD è riusabile come base per planning e architettura senza ridefinire il perimetro.

## 9. Rischi, dipendenze e questioni aperte

### Rischi
- La qualità e stabilità dell'API pubblica possono influenzare l'MVP.
- Dettagli contatto non uniformi tra gli annunci potrebbero complicare la UI.

### Dipendenze
- API pubblica per annunci alloggi.

### Questioni aperte o `TBD`
- `TBD`: definire se i contatti supportano azioni dirette o sola consultazione.
- `TBD`: confermare se i preferiti devono includere note personali oppure solo salvataggio semplice.

## 10. Passaggio al planning

Una volta approvato questo PRD, il passo successivo è derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md`, idealmente tramite `prd-to-plan`. Se quella skill non fosse disponibile, questi documenti vanno comunque esplicitati come fase successiva, senza confonderli con il PRD.
```

## Rischi o punti da controllare

- Verificare i limiti reali dell'API pubblica.
- Confermare il livello di dettaglio dei contatti esposti nel dettaglio annuncio.

## Test manuali suggeriti

- Controllare che il documento non allarghi l'MVP a prenotazioni, chat o login.
- Verificare che `TBD` e assunzioni residue siano pochi e ben circoscritti.
