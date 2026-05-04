using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class BusinessDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string StatusText => IsActive ? "Attiva" : "Inattiva";
}

public partial class BusinessListViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public ObservableCollection<BusinessDto> Businesses { get; } = new();

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;

    public BusinessListViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Le mie attività";
    }

    [RelayCommand]
    public async Task LoadAsync()
    {
        if (IsBusy) return;
        HasError = false;
        try
        {
            IsBusy = true;
            var list = await _httpClient.GetFromJsonAsync<BusinessDto[]>("api/businesses");
            Businesses.Clear();
            if (list != null)
                foreach (var b in list) Businesses.Add(b);
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = ex.Message;
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task AddBusinessAsync()
    {
        await Shell.Current.GoToAsync(nameof(Views.BusinessDetailPage));
    }

    [RelayCommand]
    private async Task EditBusinessAsync(BusinessDto business)
    {
        if (business == null) return;
        await Shell.Current.GoToAsync($"{nameof(Views.BusinessDetailPage)}?businessId={business.Id}");
    }

    [RelayCommand]
    private async Task OpenHoursAsync(BusinessDto business)
    {
        if (business == null) return;
        await Shell.Current.GoToAsync(
            $"{nameof(Views.BusinessOpeningHoursPage)}?businessId={business.Id}");
    }
}
