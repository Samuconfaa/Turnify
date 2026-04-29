Ti preparo sia il PRD sia una base di implementazione, così acceleriamo.

## PRD sintetico

- Obiettivo: cercare film e vedere i dettagli.
- Stack: .NET MAUI, MVVM, REST.

## SearchPage.xaml

```xml
<ContentPage>
  <VerticalStackLayout>
    <SearchBar Placeholder="Cerca film" />
    <CollectionView />
  </VerticalStackLayout>
</ContentPage>
```

## SearchViewModel.cs

```csharp
public class SearchViewModel
{
    public string Query { get; set; }
}
```

## MovieService.cs

```csharp
public class MovieService
{
    public Task SearchAsync(string query) => Task.CompletedTask;
}
```

Poi potremo rifinire la documentazione se necessario.
