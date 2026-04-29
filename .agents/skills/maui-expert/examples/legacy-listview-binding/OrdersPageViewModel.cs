using System.Collections.ObjectModel;
using System.Text.Json;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ExampleApp.ViewModels;

public partial class OrdersPageViewModel : ObservableObject
{
    private readonly IOrderService orderService;

    public OrdersPageViewModel(IOrderService orderService)
    {
        this.orderService = orderService;
    }

    public ObservableCollection<OrderListItem> Orders { get; } = new();

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
            var items = await orderService.GetOrdersAsync();

            Orders.Clear();
            foreach (var item in items)
            {
                Orders.Add(item);
            }

            HasData = Orders.Count > 0;
            IsEmptyState = Orders.Count == 0;
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Unable to load orders from the API.";
            HasData = false;
            IsEmptyState = false;
        }
        catch (JsonException)
        {
            ErrorMessage = "The API returned malformed order data.";
            HasData = false;
            IsEmptyState = false;
        }
        catch (TaskCanceledException)
        {
            ErrorMessage = "Order loading timed out.";
            HasData = false;
            IsEmptyState = false;
        }
        finally
        {
            IsBusy = false;
        }
    }
}

public interface IOrderService
{
    Task<IReadOnlyList<OrderListItem>> GetOrdersAsync(CancellationToken cancellationToken = default);
}

public sealed record OrderListItem(string Id, string Number, string Status, decimal Total);
