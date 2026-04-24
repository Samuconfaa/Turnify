# Piano breve

Obiettivo dell'iterazione: definire in modo coerente e repository-relative i file plausibili per una iterazione MAUI MVVM che aggiunge il dettaglio libro, senza estendere il perimetro ad altre feature.

# File da creare o modificare

Percorsi corretti rispetto alla struttura consigliata del repository:

- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/BookScout.Mobile.csproj`
- `docs/plan.md`
- `docs/iterations/it-04.md`

File plausibili aggiuntivi per una iterazione di dettaglio libro in una app MAUI MVVM:

- `src/BookScout.Mobile/AppShell.xaml` se serve registrare la route Shell verso il dettaglio.
- `src/BookScout.Mobile/AppShell.xaml.cs` se la navigazione richiede supporto lato code-behind della Shell.
- `src/BookScout.Mobile/Models/Book.cs` solo se il modello libro non esiste già o va esteso con campi di dettaglio.
- `src/BookScout.Mobile/Services/IBookService.cs` se manca il contratto per `GetBookByIdAsync`.
- `src/BookScout.Mobile/Services/BookService.cs` se manca l'implementazione per caricare il dettaglio libro.
- `docs/spec.md` se l'iterazione introduce requisiti o criteri di accettazione nuovi.
- `docs/test-matrix.md` se si vogliono registrare i test eseguiti sul dettaglio libro.

# Implementazione richiesta

Percorsi incoerenti originali e normalizzazione corretta:

- `src/ViewModels/BookDetailViewModel.cs` -> `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- `src/Views/BookDetailPage.xaml` -> `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `plan.md` -> `docs/plan.md`
- `iterations/it-04.md` -> `docs/iterations/it-04.md`
- `BookScout.Mobile.csproj` -> `src/BookScout.Mobile/BookScout.Mobile.csproj`

Ambito consigliato per l'iterazione:

- creare la pagina `BookDetailPage` e il relativo `BookDetailViewModel`;
- collegare la navigazione Shell con passaggio dell'identificativo del libro;
- caricare il dettaglio tramite servizio esistente o esteso;
- gestire `IsBusy`, `ErrorMessage` e `HasData`;
- aggiornare almeno `docs/plan.md` e `docs/iterations/it-04.md`.

Criteri di accettazione plausibili:

- tutti i percorsi nei documenti e nel piano sono repository-relative e coerenti con `src/<ProjectName>/` e `docs/`;
- il dettaglio libro è rappresentato da View, ViewModel e, se necessario, route Shell;
- la documentazione di iterazione cita i file creati e modificati con i percorsi normalizzati;
- non viene introdotta logica REST nella View o nel code-behind.

# Rischi o punti da controllare

- Nel repository attuale `src/` è vuota, quindi `BookScout.Mobile` appare come nome plausibile derivato dai percorsi forniti e dal riferimento di struttura, ma non verificato da un progetto MAUI reale già presente.
- `BookDetailPage.xaml.cs`, `AppShell.xaml` e i servizi sono plausibili ma dipendono da come è stata impostata la navigazione nelle iterazioni precedenti.
- Se il dettaglio libro richiede campi non ancora definiti, potrebbe servire anche aggiornare il modello e la specifica in `docs/spec.md`.

# Test manuali suggeriti

- Verificare che piano e documentazione usino solo percorsi repository-relative, mai percorsi locali assoluti.
- Controllare che ogni file applicativo stia sotto `src/BookScout.Mobile/` e non direttamente sotto `src/`.
- Controllare che ogni file documentale stia sotto `docs/` o `docs/iterations/`.
- Se l'iterazione viene implementata, testare apertura pagina dettaglio, passaggio parametro libro, stato di caricamento, stato di errore e navigazione indietro.
