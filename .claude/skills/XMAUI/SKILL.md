---
name: maui-expert
description: Guida l'agente nello sviluppo di applicazioni .NET MAUI
  con architettura MVVM, CommunityToolkit.Mvvm, Shell navigation
  e gestione degli stati UI. Usare questa skill quando si lavora
  su file .cs, .xaml, servizi REST o ViewModel del progetto MAUI.
---

## Contesto del progetto

Questo progetto è una app .NET MAUI con target principale Android.
L'architettura è MVVM con CommunityToolkit.Mvvm.
La navigazione usa Shell con TabBar.
La persistenza locale usa SQLite (sqlite-net-pcl) e Preferences.

## Regole architetturali obbligatorie

- Ogni pagina ha il proprio ViewModel dedicato.
- La logica NON va nel code-behind (.xaml.cs): il code-behind contiene
  solo l'inizializzazione e l'impostazione del BindingContext.
- I servizi (API REST, database) sono separati dai ViewModel.
- I servizi sono iniettati tramite costruttore (Dependency Injection).
- Ogni ViewModel che carica dati remoti deve esporre:
  - IsBusy (bool) - stato di caricamento
  - ErrorMessage (string) - messaggio di errore
  - HasData (bool) - indicatore di dati disponibili
  - IsEmptyState (bool) - indicatore di risultato vuoto

## Pattern per i ViewModel

Usare sempre CommunityToolkit.Mvvm con source generators:

- [ObservableProperty] per le proprietà di stato
- [RelayCommand] per i comandi
- ObservableCollection<T> per le liste
- Metodi asincroni (async Task) per le operazioni remote

Esempio di struttura ViewModel corretta:

​```csharp
public partial class SearchViewModel : ObservableObject
{
    private readonly IBookService _bookService;

    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    [ObservableProperty]
    private bool _isEmptyState;

    public ObservableCollection<BookDto> Results { get; } = new();

    public SearchViewModel(IBookService bookService)
    {
        _bookService = bookService;
    }

    [RelayCommand]
    private async Task SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return;
        try
        {
            IsBusy = true;
            ErrorMessage = string.Empty;
            Results.Clear();
            var results = await _bookService.SearchAsync(query);
            foreach (var item in results) Results.Add(item);
            IsEmptyState = Results.Count == 0;
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Connessione non disponibile.";
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Errore: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }
}
​```

## Pattern per i Service REST

- Usare HttpClient iniettato dal costruttore.
- Usare System.Text.Json per la deserializzazione.
- Gestire: HttpRequestException, JsonException, TaskCanceledException.
- Restituire liste vuote o null in caso di errore, mai lanciare eccezioni non gestite.
- Configurare un timeout ragionevole (10-15 secondi).

## Pattern XAML

- Usare ContentPage con Shell.
- Usare Grid come layout principale della pagina.
- Usare CollectionView per le liste (non ListView).
- Usare DataTemplate per definire l'aspetto degli elementi.
- Gestire gli stati visivi con IsVisible binding:
  - ActivityIndicator per IsBusy
  - Label per ErrorMessage
  - Label per IsEmptyState
  - CollectionView per HasData

## Anti-pattern da evitare

- NON inserire chiamate HTTP nel code-behind.
- NON usare eventi Click nel XAML: usare Command binding.
- NON creare ViewModel senza proprietà di stato.
- NON ignorare la gestione degli errori.
- NON aggiungere pacchetti NuGet senza motivazione.
- NON mescolare navigazione Shell con Navigation.PushAsync.