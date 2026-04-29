# Normalizzazione percorsi

Percorsi repository-relative coerenti con la struttura del repository:

- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `docs/plan.md`
- `docs/iterations/it-04-book-detail.md`
- `src/BookScout.Mobile/BookScout.Mobile.csproj`

Motivazione sintetica:

- i file applicativi MAUI stanno plausibilmente sotto `src/BookScout.Mobile/`
- la documentazione di piano e iterazioni sta sotto `docs/`
- le iterazioni seguono già il prefisso `docs/iterations/it-xx...md`

## File plausibili per una iterazione che aggiunge il dettaglio libro in una app MAUI MVVM

File minimi e plausibili:

- `src/BookScout.Mobile/BookScout.Mobile.csproj`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- `src/BookScout.Mobile/Models/BookDetail.cs`
- `src/BookScout.Mobile/Services/IBookService.cs`
- `src/BookScout.Mobile/Services/BookService.cs`
- `src/BookScout.Mobile/AppShell.xaml`
- `src/BookScout.Mobile/AppShell.xaml.cs`
- `docs/plan.md`
- `docs/iterations/it-04-book-detail.md`

File aggiuntivi plausibili, se il progetto separa DTO, mapping o stato UI:

- `src/BookScout.Mobile/Models/BookDetailDto.cs`
- `src/BookScout.Mobile/Services/ServiceException.cs`
- `src/BookScout.Mobile/Converters/NullOrEmptyToBoolConverter.cs`
- `docs/test-matrix.md`

Se vuoi mantenere l'iterazione molto piccola, il set più credibile è questo:

- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml.cs`
- `src/BookScout.Mobile/ViewModels/BookDetailViewModel.cs`
- `src/BookScout.Mobile/Services/IBookService.cs`
- `src/BookScout.Mobile/Services/BookService.cs`
- `src/BookScout.Mobile/AppShell.xaml`
- `docs/iterations/it-04-book-detail.md`
