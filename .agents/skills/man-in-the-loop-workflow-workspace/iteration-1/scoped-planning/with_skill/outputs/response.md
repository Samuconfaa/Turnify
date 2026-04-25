# Piano breve

Obiettivo dell'iterazione: implementare solo `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`, mantenendo fuori scope `XAML`, route Shell, page code-behind e wiring di navigazione.

La responsabilità del ViewModel deve essere limitata a:

- esporre `Title`, `Author`, `Description`, `CoverUrl`;
- esporre `LoadBookCommand` per il caricamento asincrono del dettaglio;
- gestire gli stati `IsBusy`, `ErrorMessage` e `HasData`;
- usare il service esistente `IBookService.GetBookByIdAsync(string id)` senza introdurre nuove librerie o nuova logica UI.

Nota di contesto: nella workspace di questa eval non è presente il sorgente MAUI reale sotto `src/`; i path sotto indicati sono quindi i target repository-relative coerenti con il workflow e con gli esempi del repository.

# File da creare o modificare

Da creare:

- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`

Da verificare come dipendenze esistenti, ma non da estendere in questa iterazione salvo blocchi tecnici reali:

- `src/BookScout.Mobile/Services/IBookService.cs`
- `src/BookScout.Mobile/Services/BookService.cs`
- `src/BookScout.Mobile/Models/BookDto.cs` oppure il model già usato dal service
- eventuale base class MVVM già presente nel progetto

Fuori scope esplicito per questa iterazione:

- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/AppShell.xaml.cs`
- `src/BookScout.Mobile/MauiProgram.cs`

# Implementazione richiesta

Dipendenze funzionali da confermare prima del coding:

- disponibilità di `IBookService` con metodo `GetBookByIdAsync(string id)`;
- formato del dato restituito dal service e mapping verso `Title`, `Author`, `Description`, `CoverUrl`;
- presenza di `CommunityToolkit.Mvvm` già adottato nel progetto per `[ObservableProperty]` e `[RelayCommand]`;
- eventuale convenzione esistente per messaggi di errore e gestione nullability.

Criteri di accettazione:

- esiste il solo file `BookDetailViewModel.cs` come deliverable di codice dell'iterazione;
- il ViewModel riceve `IBookService` via costruttore;
- `LoadBookCommand` accetta un id libro e richiama `GetBookByIdAsync` in modo asincrono;
- all'avvio del caricamento `IsBusy` diventa `true` e `ErrorMessage` viene azzerato;
- in caso di successo con dati validi, `Title`, `Author`, `Description` e `CoverUrl` vengono valorizzati e `HasData` diventa `true`;
- in caso di risposta nulla, id non valido o errore di servizio, `HasData` diventa `false` e `ErrorMessage` viene popolato con un messaggio comprensibile;
- `IsBusy` torna sempre a `false` anche in caso di eccezione;
- non viene generato alcun file XAML e non viene aggiunta logica nel code-behind;
- non vengono introdotte nuove dipendenze NuGet.

Valutazione del rischio: medio-basso, perché lo scope è piccolo ma dipende dalla forma reale del contratto `IBookService` e dal model restituito.

Branch suggerito se si vuole seguire il workflow completo Git:

- `feature/it-02-book-detail-viewmodel`

# Rischi o punti da controllare

- Il contratto reale di `IBookService` potrebbe non coincidere con l'esempio del workflow.
- Il model restituito dal service potrebbe richiedere mapping o normalizzazioni non previste nello scope minimo.
- Se il progetto usa già una base ViewModel con stato condiviso, duplicare `IsBusy`, `ErrorMessage` e `HasData` sarebbe un anti-pattern.
- Va chiarito se `LoadBookCommand` debba proteggersi da richieste concorrenti quando `IsBusy` è già `true`.
- Va deciso il comportamento su campi mancanti, ad esempio descrizione o copertina assenti.
- Se il prossimo step prevede Shell query parameters, conviene non anticipare ora logica di navigazione nel ViewModel.

# Test manuali suggeriti

Anche senza XAML, i controlli minimi da pianificare sono:

- esecuzione di `LoadBookCommand` con id valido: dati caricati e `HasData = true`;
- esecuzione con id vuoto o nullo: errore gestito senza crash;
- risposta del service nulla: `HasData = false` e messaggio errore visibile al binding futuro;
- eccezione rete o timeout: `IsBusy` ripristinato e `ErrorMessage` valorizzato;
- doppia esecuzione rapida del comando: verificare assenza di stato incoerente.

Documentazione da aggiornare quando l'iterazione verrà davvero avviata o chiusa:

- `docs/plan.md` se questa iterazione entra nella roadmap;
- `docs/iterations/it-xx.md` per registrare obiettivo, file, test ed esito.
