using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class BusinessFormDto
{
    public string Name { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

[QueryProperty(nameof(BusinessId), "businessId")]
public partial class BusinessDetailViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _businessId;
    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private string _businessType = string.Empty;
    [ObservableProperty] private string _address = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;
    [ObservableProperty] private bool _isActive = true;

    public bool IsEditMode => BusinessId > 0;
    public bool IsCreateMode => !IsEditMode;

    public string[] BusinessTypes { get; } =
    {
        "Ristorante", "Bar", "Pizzeria", "Gelateria",
        "Negozio", "Palestra", "Parrucchiere", "Altro"
    };

    public BusinessDetailViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Nuova attività";
    }

    async partial void OnBusinessIdChanged(int value)
    {
        Title = IsEditMode ? "Modifica attività" : "Nuova attività";
        OnPropertyChanged(nameof(IsEditMode));
        OnPropertyChanged(nameof(IsCreateMode));
        if (IsEditMode) await LoadAsync();
    }

    private async Task LoadAsync()
    {
        try
        {
            IsBusy = true;
            var b = await _httpClient.GetFromJsonAsync<BusinessFormDto>($"api/businesses/{BusinessId}");
            if (b != null)
            {
                Name = b.Name;
                BusinessType = b.BusinessType;
                Address = b.Address;
                Phone = b.Phone;
                IsActive = b.IsActive;
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (JsonException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Il nome dell'attività è obbligatorio.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var dto = new BusinessFormDto
            {
                Name = Name,
                BusinessType = BusinessType,
                Address = Address,
                Phone = Phone,
                IsActive = IsActive
            };

            HttpResponseMessage response;
            if (IsCreateMode)
                response = await _httpClient.PostAsJsonAsync("api/businesses", dto);
            else
                response = await _httpClient.PutAsJsonAsync($"api/businesses/{BusinessId}", dto);

            if (response.IsSuccessStatusCode)
            {
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile salvare l'attività.", "OK");
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (JsonException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (!IsEditMode) return;
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Disattiva attività", $"Vuoi disattivare '{Name}'?", "Sì", "Annulla");
        if (!confirm) return;
        try
        {
            IsBusy = true;
            await _httpClient.DeleteAsync($"api/businesses/{BusinessId}");
            await Shell.Current.GoToAsync("..");
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }
}
