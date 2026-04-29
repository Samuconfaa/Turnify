# Maui Expert Examples

These examples are bundled as concrete references for list binding in .NET MAUI.

- `collectionview-binding/` is the preferred example for new list screens.
- `legacy-listview-binding/` is a legacy maintenance example for pages that already use `ListView`.

For current MAUI projects, prefer `CollectionView` and do not introduce new `ListView` usage.

If you find an existing `ListView`, keep it only when the task is explicitly maintenance-oriented and offer migration to `CollectionView` as an option.

Both examples show:

- `CommunityToolkit.Mvvm` with `[ObservableProperty]` and `[RelayCommand]`
- constructor injection for services
- compiled bindings with `x:DataType`
- explicit handling of `IsBusy`, `ErrorMessage`, `HasData`, and `IsEmptyState`
- explicit handling of `HttpRequestException`, `JsonException`, and `TaskCanceledException`

Neither example places logic in code-behind.
