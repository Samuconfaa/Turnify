# Iterazione 19

## Data
2026-05-09

## Commit
da definire dopo merge

## Obiettivo
Aggiungere paginazione server-side + infinite scroll mobile alle liste principali, risolvere i warning di build residui (CA1416, MVVMTK0034) e allineare il formato di risposta delle API paginate.

## Piano
1. Fix CA1416: sostituire `Build.VERSION.SdkInt >= BuildVersionCodes.Tiramisu` con `OperatingSystem.IsAndroidVersionAtLeast(33)` in `MainActivity.cs`
2. Fix MVVMTK0034: sostituire accesso diretto al backing field `_isDarkTheme` con assegnazione via proprietà `IsDarkTheme` in `ProfileViewModel.cs`
3. Creare DTO generico `PaginatedResult<T>` in `src/Api/Turnify.Api/DTOs/`
4. Aggiungere `page`/`pageSize` a `EmployeesController.GetEmployees`, risposta `PaginatedResult<EmployeeDto>`
5. Allineare `AttendanceController.GetHistory` e `VacationRequestsController.GetVacationRequests` aggiungendo `hasMore` alla risposta
6. Aggiungere infinite scroll (page tracking + `LoadMoreCommand`) ai tre ViewModel MAUI
7. Aggiungere `RemainingItemsThreshold` + `ActivityIndicator` footer nei tre CollectionView XAML

## Prompt principali utilizzati
- "hai la iterazione 19 da fare?" — avvio planning e implementazione it-19

## File creati/modificati
- `src/Turnify.Mobile/Platforms/Android/MainActivity.cs` — fix CA1416: `OperatingSystem.IsAndroidVersionAtLeast(33)`
- `src/Turnify.Mobile/ViewModels/ProfileViewModel.cs` — fix MVVMTK0034: `IsDarkTheme =` invece di `_isDarkTheme =` + `OnPropertyChanged`
- `src/Api/Turnify.Api/DTOs/PaginatedResult.cs` — **nuovo** DTO generico con `Data`, `Total`, `Page`, `PageSize`, `HasMore`
- `src/Api/Turnify.Api/Controllers/EmployeesController.cs` — aggiunto `page`/`pageSize`, ritorna `PaginatedResult<EmployeeDto>`
- `src/Api/Turnify.Api/Controllers/AttendanceController.cs` — aggiunto `hasMore` alla risposta
- `src/Api/Turnify.Api/Controllers/VacationRequestsController.cs` — aggiunto `total` e `hasMore` alla risposta
- `src/Turnify.Mobile/ViewModels/EmployeeListViewModel.cs` — `EmployeePagedResponse`, `_currentPage`, `_hasMore`, `IsLoadingMore`, `LoadMoreCommand`
- `src/Turnify.Mobile/Views/EmployeeListPage.xaml` — `RemainingItemsThreshold`, `ActivityIndicator` nel Footer
- `src/Turnify.Mobile/ViewModels/AttendanceHistoryViewModel.cs` — page tracking, `LoadMoreCommand`, `AttendanceHistoryResponse.HasMore`
- `src/Turnify.Mobile/Views/AttendanceHistoryPage.xaml` — `RemainingItemsThreshold`, Footer `ActivityIndicator`
- `src/Turnify.Mobile/ViewModels/VacationListViewModel.cs` — `VacationPagedResponse`, page tracking, `LoadMoreCommand`
- `src/Turnify.Mobile/Views/VacationListPage.xaml` — `RemainingItemsThreshold`, Footer `ActivityIndicator`

## Da verificare manualmente
- Flusso FCM end-to-end: admin crea turno → notifica appare nella tab dipendente
