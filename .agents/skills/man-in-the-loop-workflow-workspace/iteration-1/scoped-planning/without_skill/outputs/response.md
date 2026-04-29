# Planning scoped: BookDetailViewModel

## 1. Piano breve

Obiettivo della prossima iterazione: implementare solo `BookDetailViewModel` in architettura MVVM, senza creare ancora la View XAML. Il ViewModel dovrà caricare il dettaglio di un libro tramite un service dedicato, esporre proprietà bindabili per i dati del libro e gestire in modo esplicito gli stati `IsBusy`, `ErrorMessage`, `HasData` e `IsEmptyState`.

Scope consigliato:

- creare il ViewModel;
- collegarlo a un contratto di service già esistente oppure definire chiaramente la dipendenza attesa;
- supportare il caricamento per `bookId`;
- non toccare ancora XAML, code-behind o navigazione grafica.

Branch consigliato per l'iterazione: `feature/book-detail-viewmodel` oppure `it-xx-book-detail-viewmodel`.

## 2. File da creare o modificare

Poiché nel repository attuale non risultano ancora file applicativi sotto `src/`, i percorsi seguenti vanno intesi come target proposti per l'iterazione:

- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs` - nuovo file principale dell'iterazione;
- `src/BookScout.Mobile/Services/IBookService.cs` - solo se il contratto non esiste già e serve formalizzare `GetBookByIdAsync`;
- `src/BookScout.Mobile/Models/BookDetailDto.cs` oppure `src/BookScout.Mobile/Models/Book.cs` - solo se manca un modello coerente per il dettaglio;
- `src/BookScout.Mobile/MauiProgram.cs` - solo se sarà necessario registrare il ViewModel e il service in dependency injection;
- `docs/iterations/it-xx.md` - aggiornamento documentale a valle dell'implementazione.

Per mantenere l'iterazione stretta, l'obiettivo migliore è toccare solo `BookDetailViewModel.cs` e usare dipendenze già presenti.

## 3. Dipendenze

Dipendenze tecniche previste:

- `CommunityToolkit.Mvvm` per `ObservableObject`, `[ObservableProperty]` e `[RelayCommand]`;
- un service applicativo, idealmente `IBookService`, con un metodo asincrono tipo `GetBookByIdAsync(string id, CancellationToken cancellationToken = default)`;
- un modello dati per il dettaglio libro con campi minimi come `Title`, `Author`, `Description` e `CoverUrl`;
- eventuale integrazione futura con Shell per ricevere `bookId`, ma senza implementare ancora la View.

Dipendenze logiche da chiarire prima della build:

- se il `bookId` arriva via costruttore, proprietà pubblica o query parameter di Shell;
- se il service restituisce un DTO remoto o un modello già mappato per la UI;
- se il progetto usa già DI in `MauiProgram.cs`.

## 4. Implementazione richiesta

Il `BookDetailViewModel` dovrebbe includere almeno:

- proprietà bindabili per i dati del libro: `Title`, `Author`, `Description`, `CoverUrl`;
- proprietà di stato: `IsBusy`, `ErrorMessage`, `HasData`, `IsEmptyState` e opzionalmente `HasError`;
- un comando asincrono di caricamento, ad esempio `LoadAsync` o `LoadBookAsync`;
- protezione da richiami concorrenti quando `IsBusy` è già `true`;
- reset corretto dello stato prima di un nuovo caricamento;
- gestione esplicita degli errori attesi: `HttpRequestException`, `JsonException`, `TaskCanceledException`;
- comportamento coerente quando il libro non viene trovato o il service restituisce `null`.

Fuori scope in questa iterazione:

- qualunque file XAML;
- code-behind;
- template UI, visual states o layout;
- refactoring ampio di service o navigazione se non strettamente necessario.

## 5. Criteri di accettazione

La feature può considerarsi accettata quando:

- esiste `BookDetailViewModel` con responsabilità chiara e singola;
- il ViewModel riceve il service tramite costruttore, senza logica REST nel code-behind;
- il caricamento asincrono di un libro per `bookId` aggiorna correttamente `Title`, `Author`, `Description` e `CoverUrl`;
- durante il caricamento `IsBusy` è `true` e torna `false` al termine anche in caso di errore;
- in caso di successo `HasData = true`, `IsEmptyState = false` ed `ErrorMessage` è vuoto;
- in caso di dato mancante o risposta vuota `HasData = false` e `IsEmptyState = true`;
- in caso di errore di rete, timeout o JSON malformato, `ErrorMessage` viene valorizzato e lo stato resta consistente;
- il codice usa MVVM Toolkit e naming coerente con il progetto;
- non viene generato alcun file XAML in questa iterazione.

## 6. Rischi o punti da controllare

- Nel repository attuale manca ancora la struttura applicativa sotto `src/`: prima della build va confermato il path reale del progetto MAUI.
- Il contratto del service non è visibile: se `IBookService` non esiste, l'iterazione rischia di allargarsi oltre il solo ViewModel.
- Non è ancora definito come arriva `bookId`: senza questa decisione il ViewModel può risultare corretto ma non integrabile subito.
- Va chiarito come rappresentare il caso "libro non trovato": `null`, eccezione dedicata o DTO vuoto.
- Se il modello dati remoto non coincide con i campi UI, potrebbe servire mapping aggiuntivo che amplia lo scope.
- La gestione di `CoverUrl` richiede attenzione a valori nulli o URL non validi, anche se la UI non viene ancora creata.

## 7. Test manuali suggeriti

Anche senza XAML, i test manuali o semi-manuali consigliati sul ViewModel sono:

- caricamento con `bookId` valido e verifica del popolamento di tutte le proprietà;
- doppio avvio del comando mentre `IsBusy` è `true` e verifica che non partano caricamenti concorrenti;
- risposta vuota o libro assente e verifica di `IsEmptyState`;
- simulazione di errore HTTP e verifica di `ErrorMessage`;
- simulazione di timeout e verifica del ripristino di `IsBusy`;
- simulazione di JSON malformato e verifica dello stato finale;
- nuovo caricamento dopo un errore e verifica che il vecchio messaggio venga ripulito.

## 8. Nota operativa

Per restare aderenti al workflow del progetto, la build successiva dovrebbe partire da un prompt ristretto come questo:

> Implementare solo `BookDetailViewModel.cs` per una app .NET MAUI in MVVM con `CommunityToolkit.Mvvm`. Il ViewModel deve ricevere `IBookService` via costruttore, esporre `Title`, `Author`, `Description`, `CoverUrl`, `IsBusy`, `ErrorMessage`, `HasData`, `IsEmptyState` e un comando asincrono di caricamento per `bookId`. Gestire `HttpRequestException`, `JsonException` e `TaskCanceledException`. Non creare XAML, non toccare code-behind, non aggiungere nuove librerie NuGet.
