# Iterazione 04

## Obiettivo
Aggiungere la pagina di dettaglio libro raggiungibile dalla lista, con caricamento dati per id, gestione degli errori principali e navigazione di ritorno coerente con Shell.

## Piano
- creare `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- creare `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- creare `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- registrare la route della pagina dettaglio in `src/BookScout.Mobile/AppShell.xaml.cs`
- registrare pagina e ViewModel nel container DI in `src/BookScout.Mobile/MauiProgram.cs`
- caricare il libro per id con gestione di `IsBusy`, `ErrorMessage` e `HasData`
- gestire i casi di id non valido, risposta API nulla e assenza di rete

## File coinvolti nella specifica
- `docs/spec.md` (sezione dettaglio libro)
- `docs/plan.md` (iterazione 04)
- `docs/test-matrix.md` (verifiche su navigazione, API e stati UI)

## Prompt principali utilizzati
1. "Crea la pagina `BookDetailPage` con relativo `BookDetailViewModel` in MVVM per .NET MAUI. La pagina deve mostrare copertina, titolo, autore e descrizione del libro, con stato di caricamento ed errore."
2. "Aggiorna `AppShell.xaml.cs` per registrare la route del dettaglio e `MauiProgram.cs` per la dependency injection di pagina e ViewModel. Il dettaglio deve ricevere l'id del libro e caricare i dati in modo asincrono."

## File creati
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`

## File modificati
- `src/BookScout.Mobile/AppShell.xaml.cs` (aggiunta route della pagina dettaglio)
- `src/BookScout.Mobile/MauiProgram.cs` (registrazione DI di pagina e ViewModel)

## Codice prodotto dall'AI e accettato
- Struttura iniziale della pagina dettaglio con binding al ViewModel.
- ViewModel di dettaglio con caricamento asincrono del libro e gestione degli stati principali.
- Configurazione della route Shell e registrazione nel container DI.

## Codice prodotto dall'AI e modificato manualmente
- Aggiunto un controllo `null` nel service dopo il recupero dei dati, perché inizialmente la risposta API nulla non era gestita.
- Aggiunta una placeholder image per il caso di copertina mancante o URL non disponibile.
- Rifinita la gestione dell'errore mostrato quando l'id passato alla pagina non è valido.

## Test eseguiti
- [x] Apertura del dettaglio libro: OK
- [x] Id non valido: mostra messaggio di errore
- [x] Rete assente: mostra messaggio di errore
- [x] Back navigation verso la pagina precedente: OK
- [ ] Layout in landscape: da rifinire

## Problemi trovati
- La risposta API nulla non era gestita nella prima versione del flusso di caricamento.
- L'immagine del libro non mostrava un placeholder quando la copertina era assente.
- In modalità landscape il layout è utilizzabile ma richiede una rifinitura visiva.

## Correzioni effettuate
- Inserito un controllo esplicito sul risultato nullo nel service prima dell'aggiornamento dello stato del ViewModel.
- Aggiunta una immagine placeholder per i casi di copertina mancante.
- Consolidata la visualizzazione degli errori per i casi di id non valido e rete non disponibile.

## Esito
Completato con riserva: la pagina dettaglio è funzionante per navigazione, caricamento ed errori principali, ma il layout in landscape deve essere rifinito in una iterazione successiva.
