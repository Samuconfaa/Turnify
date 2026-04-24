## Piano breve

1. Chiarisco i punti che impattano davvero il perimetro del PRD.
2. Ti preparo una prima bozza di `docs/spec.md` con assunzioni esplicite e `TBD` minimi.
3. Lascio fuori planning dettagliato e codice, così il documento resta un vero PRD di progetto.

## File da creare o modificare

- `docs/spec.md`.

## Implementazione richiesta

Prima di consolidare il PRD completo, mi servono 4 chiarimenti essenziali:

1. Qual è la fonte principale dei libri?
   A. API pubblica remota
   B. Catalogo locale precaricato
   C. Entrambe
   D. Altro: [specifica]

2. Chi è l'utente principale dell'MVP?
   A. Studente che cerca libri da leggere
   B. Studente che consulta testi universitari
   C. Utente generico appassionato di lettura
   D. Altro: [specifica]

3. Cosa deve restare fuori dalla prima versione?
   A. Login e profilo utente
   B. Recensioni/commenti
   C. Sincronizzazione cloud multi-dispositivo
   D. Altro: [specifica]

4. I preferiti devono essere disponibili anche offline?
   A. Sì, sempre
   B. Solo ultima lista salvata
   C. Non è un requisito per ora
   D. Altro: [specifica]

Per non bloccarti, sotto trovi la bozza iniziale da salvare in `docs/spec.md`, con assunzioni dichiarate.

```md
# Specifica di Progetto - Book Finder MAUI

## 1. Visione e contesto

### Problema da risolvere
Lo studente ha bisogno di cercare rapidamente libri, consultare i dettagli essenziali e salvare quelli rilevanti senza perdersi in un catalogo dispersivo.

### Obiettivo del progetto
Realizzare una app `.NET MAUI` Android-first che permetta ricerca libri, consultazione dettaglio e gestione preferiti in modo chiaro e adatto a un workflow didattico guidato da documentazione.

### Utenti target
- Studenti che cercano libri o testi di interesse.
- `TBD`: confermare se il focus è lettura generale o testi accademici.

## 2. Ambito MVP

### Flusso principale da supportare
L'utente inserisce una ricerca, visualizza i risultati, apre il dettaglio di un libro e salva o rimuove il libro dai preferiti.

### Funzionalità obbligatorie
- Ricerca libri.
- Lista risultati con stato loading, empty, errore e successo.
- Pagina dettaglio libro.
- Salvataggio preferiti in persistenza locale.

### Funzionalità opzionali future
- Cronologia ricerche.
- Filtri avanzati.
- Sincronizzazione cloud.

### Non-obiettivi
- Login nell'MVP.
- Commenti o recensioni utente.
- Acquisto libri in-app.

## 3. Scenari d'uso principali

### Scenario 1
Uno studente cerca un libro per titolo o autore e apre il dettaglio per verificarne la pertinenza.

### Scenario 2
Lo studente salva alcuni libri nei preferiti per consultarli di nuovo rapidamente.

## 4. Requisiti funzionali

- FR-01: l'utente deve poter cercare libri tramite una query testuale.
- FR-02: il sistema deve mostrare risultati, stato vuoto, stato di caricamento o errore in modo esplicito.
- FR-03: l'utente deve poter aprire una schermata di dettaglio con informazioni essenziali del libro.
- FR-04: l'utente deve poter aggiungere e rimuovere libri dai preferiti.
- FR-05: i preferiti devono restare disponibili localmente tra riaperture dell'app.

## 5. Epic, user stories e criteri di accettazione

### EPIC-01 - Ricerca e consultazione libri

**Obiettivo:** permettere all'utente di trovare e valutare rapidamente libri rilevanti.

**User stories:**
- Come studente, voglio cercare libri così da trovare rapidamente quelli utili.
- Come studente, voglio aprire il dettaglio così da capire se un libro è rilevante.

**Criteri di accettazione:**
- [ ] Da una ricerca valida, l'utente vede un elenco risultati oppure uno stato empty esplicito.
- [ ] In caso di errore rete o servizio non disponibile, la UI mostra un messaggio chiaro e una possibilità di riprovare.
- [ ] Il dettaglio libro è raggiungibile dalla lista risultati in non più di 2 tap dopo la ricerca.

### EPIC-02 - Gestione preferiti

**Obiettivo:** permettere all'utente di salvare libri rilevanti per consultazioni successive.

**User stories:**
- Come studente, voglio salvare un libro nei preferiti così da ritrovarlo facilmente.

**Criteri di accettazione:**
- [ ] Un libro può essere aggiunto o rimosso dai preferiti senza ambiguità sullo stato corrente.
- [ ] La lista preferiti resta disponibile dopo la chiusura e riapertura dell'app.

## 6. Requisiti non funzionali

### UX e stati UI
- Ogni flusso dati deve esporre loading, empty, success ed error state.

### Prestazioni percepite
- Il feedback di caricamento deve apparire subito dopo l'avvio della ricerca.

### Affidabilità e gestione errori
- Gli errori non devono lasciare schermate bloccate o prive di spiegazione.

### Privacy e dati
- Nessun account utente nell'MVP.
- `TBD`: definire quali dati libro vengono memorizzati nei preferiti.

## 7. Vincoli tecnici di progetto

- App `.NET MAUI`
- Architettura MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- Chiamate remote asincrone con `HttpClient`
- Parsing con `System.Text.Json`
- Persistenza locale con `Preferences` e/o SQLite
- Android come target principale; iOS opzionale

## 8. Metriche di successo

- L'utente completa ricerca -> dettaglio in modo comprensibile senza supporto esterno.
- I preferiti sopravvivono a una riapertura dell'app.
- Il PRD è sufficientemente chiaro da derivare planning e iterazioni senza reinventare il perimetro.

## 9. Rischi, dipendenze e questioni aperte

### Rischi
- API libri ancora non confermata.
- Possibile crescita scope su filtri, recensioni e sincronizzazione.

### Dipendenze
- `TBD`: confermare eventuale API pubblica per il catalogo libri.

### Questioni aperte o `TBD`
- Fonte dati definitiva.
- Target utente preciso.
- Regole offline per i preferiti.

## 10. Passaggio al planning

Una volta accettato questo PRD, il passaggio successivo è `prd-to-plan` per derivare:

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

Se `prd-to-plan` non è disponibile nell'ambiente, il prossimo passo resta comunque la derivazione di questi documenti, senza entrare già ora nel planning dettagliato.
```

## Rischi o punti da controllare

- Fonte dati libri ancora da confermare.
- Confine preciso tra preferiti offline e semplice cache lettura.
- Possibile ambiguità tra catalogo generico e focus su testi universitari.

## Test manuali suggeriti

- Verificare che ogni epic abbia criteri di accettazione osservabili.
- Controllare che l'MVP non includa feature future come sync o login.
- Confermare che i vincoli MAUI siano compatibili con il repository prima di passare al planning.
