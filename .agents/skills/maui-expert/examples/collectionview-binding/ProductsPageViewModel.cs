using System.Collections.ObjectModel;
using System.Text.Json;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ExampleApp.ViewModels;

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

    [RelayCommand]
    private Task OpenDetailsAsync(ProductListItem item)
    {
        if (item is null)
        {
            return Task.CompletedTask;
        }

        return Shell.Current.GoToAsync($"product-details?productId={Uri.EscapeDataString(item.Id)}");
    }

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

public interface IProductService
{
    Task<IReadOnlyList<ProductListItem>> GetProductsAsync(CancellationToken cancellationToken = default);
}

public sealed record ProductListItem(string Id, string Name, string Subtitle, decimal Price);
