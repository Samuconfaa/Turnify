# Iteration Example Reference

Use this file when the user wants a concrete example of what a completed iteration log should look like.

```markdown
# Iterazione 03

## Obiettivo
Aggiungere la pagina di dettaglio del libro selezionato dalla lista dei risultati.

## Piano
- creare il file `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- creare il file `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- aggiungere la route `bookdetail` nella Shell (`src/BookScout.Mobile/AppShell.xaml.cs`)
- passare l'id del libro come parametro di navigazione
- caricare i dati dal service esistente `BookService.GetBookByIdAsync`
- gestire gli stati `IsBusy`, `ErrorMessage` e `HasData`

## File coinvolti nella specifica
- `docs/spec.md` (sezione "Pagina Dettaglio")
- `docs/plan.md` (iterazione 3)

## Prompt principali utilizzati
1. "Creare `BookDetailViewModel` con proprietà `Title`, `Author`, `Description`, `CoverUrl`, `IsBusy`, `ErrorMessage`. Iniettare `IBookService` nel costruttore. Usare `CommunityToolkit.Mvvm`. Gestire il caricamento asincrono."
2. "Creare il file XAML `BookDetailPage` con layout `ScrollView` contenente immagine copertina, titolo, autore e descrizione. Binding al ViewModel. Gestire stato loading con `ActivityIndicator` e stato errore con `Label`."

## File creati
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`

## File modificati
- `src/BookScout.Mobile/AppShell.xaml.cs` (aggiunta route)
- `src/BookScout.Mobile/MauiProgram.cs` (registrazione DI)

## Test eseguiti
- [x] Apertura dettaglio da lista risultati: OK
- [x] Libro con id non valido: mostra messaggio errore
- [x] Errore API (rete disconnessa): mostra "Impossibile caricare i dati"
- [x] Ritorno alla pagina precedente con tasto back: OK
- [x] Immagine copertina non disponibile: placeholder mostrato
- [ ] Rotazione schermo: layout si adatta ma perde la posizione di scroll

## Problemi trovati
- Il ViewModel non gestiva il caso di risposta API con corpo vuoto (`200 OK` ma JSON `null`).
- L'immagine della copertina non aveva un placeholder per il caso di URL mancante.

## Correzioni effettuate
- Aggiunto controllo `null` dopo la deserializzazione nel service.
- Aggiunto placeholder image nel XAML con `FallbackSource`.
- Fix manuale: non è stato necessario un nuovo prompt, la correzione è stata fatta a mano.

## Esito
Completato con riserva: il layout in landscape necessita di rifinitura nell'iterazione successiva.
```

## What this example shows

- The objective is specific and verifiable.
- The plan lists concrete files and behaviors.
- The log captures both AI-assisted output and human validation.
- Testing includes both passed checks and remaining issues.
- The outcome is honest: a feature can be complete with noted follow-up work.
