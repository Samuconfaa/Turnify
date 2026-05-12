---
name: maui-expert
description: Write and review .NET MAUI code using MVVM with CommunityToolkit.Mvvm, clean XAML with compiled bindings, and Shell navigation. Use this skill whenever the user mentions .NET MAUI, XAML, ContentPage, Shell routes, ViewModels, bindings, CollectionView, legacy ListView maintenance, Android-first MAUI apps, or asks for MAUI architecture, state handling, or best practices, even if they do not explicitly ask for a skill.
---

# Maui Expert

Use this skill to implement or review .NET MAUI features in a way that stays readable, testable, and consistent with an MVVM application.

## Core goal

Produce the smallest correct MAUI change that fits the existing project. Keep view logic in XAML, screen behavior in ViewModels, and integration details in services.

This skill should also help students learn MAUI best practices. When the user sounds inexperienced, explain not just what to do, but why a certain MAUI pattern is the safer default.

## First pass

Before editing:

- Read the relevant page XAML, ViewModel, service, `AppShell`, and DI registrations.
- Check whether the screen already has a state pattern, route name, and constructor injection setup.
- Prefer extending the current structure over inventing a new abstraction.

## Student-safe rule

If the user is a student or the task is educational:

- explain why logic belongs in a ViewModel or service instead of code-behind;
- explain why Shell, MVVM, and `CommunityToolkit.Mvvm` are the preferred defaults here;
- call out common anti-patterns before proposing code.

## Required MAUI rules

- Use MVVM with `CommunityToolkit.Mvvm`.
- Use `[ObservableProperty]` for mutable state and `[RelayCommand]` for UI actions.
- Keep UI in XAML and use compiled bindings with `x:DataType` on the page and on list item templates.
- For list UIs in current MAUI projects, use `CollectionView`. Do not propose `ListView` for new code.
- Use Shell navigation only. Do not mix in `Navigation.PushAsync`, modal stacks, or custom navigation flows unless the project already wraps Shell and still resolves through Shell APIs.
- Inject services through constructors. Do not create services directly inside a ViewModel.
- Do not put business logic, data loading, navigation, or validation in `.xaml.cs` files.
- Do not use `OnAppearing`, `Loaded`, page events, or behavior/event bridges attached to page lifecycle events to trigger loading logic unless the user explicitly asks for that compromise.
- Catch `HttpRequestException`, `JsonException`, and `TaskCanceledException` explicitly around HTTP-backed flows.

If the project does not already reference `CommunityToolkit.Mvvm`, call that out before adding or changing NuGet packages.

Read `references/student-maui-mistakes.md` when the user needs didactic guidance.

## ViewModel contract

For every screen-level ViewModel that loads or updates data, define these state properties:

```csharp
[ObservableProperty]
private bool isBusy;

[ObservableProperty]
[NotifyPropertyChangedFor(nameof(HasError))]
private string? errorMessage;

[ObservableProperty]
private bool hasData;

[ObservableProperty]
private bool isEmptyState;

public bool HasError => !string.IsNullOrWhiteSpace(ErrorMessage);
```

Treat them consistently:

- Start work: set `IsBusy = true` and clear `ErrorMessage`.
- Success with data: set `HasData = true` and `IsEmptyState = false`.
- Success without data: set `HasData = false` and `IsEmptyState = true`.
- Failure: set `HasData = false`, `IsEmptyState = false`, and populate `ErrorMessage`.
- Finish work: set `IsBusy = false` in `finally`.

`HasData` and `IsEmptyState` should never both be `true`.

## Preferred ViewModel pattern

Use constructor injection, explicit state updates, and async relay commands:

```csharp
public partial class ProductsPageViewModel : ObservableObject
{
    private readonly IProductService productService;

    public ProductsPageViewModel(IProductService productService)
    {
        this.productService = productService;
    }

    public ObservableCollection<ProductListItem> Products { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string? errorMessage;

    [ObservableProperty]
    private bool hasData;

    [ObservableProperty]
    private bool isEmptyState;

    public bool HasError => !string.IsNullOrWhiteSpace(ErrorMessage);

    [RelayCommand]
    private Task LoadAsync() => LoadCoreAsync();

    [RelayCommand]
    private Task RefreshAsync() => LoadCoreAsync();

    private async Task LoadCoreAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var items = await productService.GetProductsAsync();

            Products.Clear();
            foreach (var item in items)
            {
                Products.Add(item);
            }

            HasData = Products.Count > 0;
            IsEmptyState = Products.Count == 0;
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Unable to reach the server.";
            HasData = false;
            IsEmptyState = false;
        }
        catch (JsonException)
        {
            ErrorMessage = "Received malformed data from the service.";
            HasData = false;
            IsEmptyState = false;
        }
        catch (TaskCanceledException)
        {
            ErrorMessage = "The request timed out.";
            HasData = false;
            IsEmptyState = false;
        }
        finally
        {
            IsBusy = false;
        }
    }
}
```

If the project already has logging, log the exception and still expose a user-safe `ErrorMessage`. Do not fail silently.

## XAML rules

Write clean XAML and keep bindings strongly typed:

```xml
<ContentPage
    x:Class="ExampleApp.Views.ProductsPage"
    xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:viewmodels="clr-namespace:ExampleApp.ViewModels"
    x:DataType="viewmodels:ProductsPageViewModel">

    <RefreshView Command="{Binding RefreshCommand}"
                 IsRefreshing="{Binding IsBusy}">
        <CollectionView ItemsSource="{Binding Products}">
            <CollectionView.ItemTemplate>
                <DataTemplate x:DataType="viewmodels:ProductListItem">
                    <Label Text="{Binding Name}" />
                </DataTemplate>
            </CollectionView.ItemTemplate>
        </CollectionView>
    </RefreshView>
</ContentPage>
```

Use `CollectionView` for new list screens.

Treat `ListView` as legacy:

- never propose it for new MAUI code
- only keep it when maintaining an existing page that already depends on it
- when you encounter it in an existing project, explicitly offer a migration path to `CollectionView`
- if the user asks for maintenance only, keep the change minimal but still mention that `CollectionView` is the modern direction

If you migrate a page from `ListView` to `CollectionView`, preserve behavior first: item template, empty state, pull-to-refresh, selection handling, and commands.

## Navigation rules

Use Shell navigation only:

```csharp
await Shell.Current.GoToAsync($"product-details?productId={Uri.EscapeDataString(productId)}");
```

Route registration belongs in `AppShell` or the app's existing Shell setup:

```csharp
Routing.RegisterRoute("product-details", typeof(ProductDetailPage));
```

If a destination needs query parameters, keep the parsing and follow-up loading in the ViewModel or in an existing navigation abstraction that still calls Shell. Do not move that behavior into code-behind.

## Code-behind rule

Treat `.xaml.cs` as wiring only. It may contain `InitializeComponent()` and nothing else unless the framework forces a tiny adaptation that cannot live elsewhere. If more logic starts to appear, move it to:

- the ViewModel
- a service
- a behavior already used by the project
- a converter already justified by the UI

Do not introduce `OnAppearing`, `Loaded`, or similar page event handlers just to start data loading. Do not treat `EventToCommandBehavior` on page lifecycle events as the default solution either. Prefer one of these patterns instead:

- trigger loading from a navigation-aware ViewModel flow when Shell navigation lands on the page
- expose an async `InitializeCommand` or `LoadCommand` on the ViewModel and connect it only through an existing non-lifecycle project pattern that is already established in the codebase
- if the project already has a lifecycle abstraction, reuse it rather than adding code-behind logic

If the only viable option would require a lifecycle event or event-to-command bridge tied to the page lifecycle, explicitly call out the tradeoff and treat it as an exception, not the default pattern.

## Common student mistakes to prevent

- putting REST calls or business logic in `.xaml.cs` because it feels faster;
- using `ListView` for new screens instead of `CollectionView`;
- creating services directly inside a ViewModel with `new`;
- forgetting `IsBusy`, `ErrorMessage`, `HasData`, and `IsEmptyState` transitions;
- treating Shell navigation as optional and mixing multiple navigation models;
- assuming a page is correct because the XAML compiles.

## HTTP and parsing errors

When a ViewModel or service calls remote endpoints, explicitly handle:

- `HttpRequestException` for transport and server reachability issues
- `JsonException` for malformed or unexpected payloads
- `TaskCanceledException` for timeouts or cancelled requests

Prefer user-friendly messages in the ViewModel and keep the original exception available for logging when the project has a logger.

## DI rules

- Register services, ViewModels, and pages in `MauiProgram` when the project uses DI.
- Inject dependencies through constructors.
- Do not use service locators or `new` inside ViewModels.
- Keep service interfaces focused on application use cases, not view concerns.

## Review checklist

When reviewing or generating MAUI code, verify:

1. The page uses XAML with `x:DataType`.
2. The ViewModel uses `CommunityToolkit.Mvvm` attributes rather than manual boilerplate.
3. The four required state properties exist and are updated coherently.
4. Services are constructor-injected.
5. Navigation uses Shell only.
6. `.xaml.cs` contains no business logic.
7. HTTP flows catch `HttpRequestException`, `JsonException`, and `TaskCanceledException`.
8. Loading, error, data, and empty states are visible in the UI.
9. New list screens use `CollectionView`, and any remaining `ListView` usage is treated as legacy with migration noted.
10. Initial data loading is not started from `OnAppearing`, `Loaded`, or lifecycle-event bridges unless the response clearly explains the tradeoff.

## Response format for substantial MAUI work

For larger MAUI tasks, keep the answer structured and practical:

1. brief plan
2. files created or modified
3. implementation summary
4. risks or checks
5. suggested manual tests

For didactic or uncertain requests, also include this table where useful:

| Topic | Preferred approach | Avoid | Why |
| --- | --- | --- | --- |

## Bundled examples

Read these examples when you need concrete list-binding patterns:

- `examples/README.md`
- `examples/collectionview-binding/ProductsPage.xaml`
- `examples/collectionview-binding/ProductsPageViewModel.cs`
- `examples/legacy-listview-binding/OrdersPage.xaml`
- `examples/legacy-listview-binding/OrdersPageViewModel.cs`

Use the `CollectionView` example as the default for new screens. Use the legacy `ListView` example only for legacy maintenance, and offer migration to `CollectionView` when it is reasonable.

Read `references/student-maui-mistakes.md` before answering questions where a student may choose the wrong MAUI pattern for convenience.
