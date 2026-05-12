# Iterazione 04 - Pagina dettaglio libro

## Obiettivo

Aggiungere la pagina di dettaglio libro, integrandola nel flusso di navigazione Shell e nella configurazione DI dell'applicazione.

## File introdotti

- `BookDetailPage.xaml`
- `BookDetailPage.xaml.cs`
- `BookDetailViewModel.cs`

## File modificati

- `AppShell.xaml.cs` per la registrazione della route di navigazione verso il dettaglio libro
- `MauiProgram.cs` per la registrazione delle dipendenze necessarie alla nuova pagina e al relativo ViewModel

## Test eseguiti

- apertura del dettaglio libro: OK
- gestione di un id non valido: mostra errore correttamente
- rete assente: mostra errore correttamente
- back navigation: OK
- visualizzazione in landscape: funzionante ma da rifinire

## Problemi riscontrati

- la risposta API nulla non era gestita nella prima implementazione
- l'immagine mancante del libro non aveva un placeholder dedicato

## Correzioni applicate

- aggiunto un controllo `null` nel service per gestire in modo esplicito la risposta API assente
- introdotta una placeholder image per i casi in cui la copertina non sia disponibile

## Esito

Completato con riserva.

La feature è utilizzabile e copre i principali casi di navigazione ed errore, ma resta un affinamento aperto sulla resa in modalità landscape.
