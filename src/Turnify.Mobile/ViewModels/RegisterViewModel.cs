using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class RegisterRequestDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string CompanySlug { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}

public partial class RegisterViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    private string _companyName = string.Empty;

    [ObservableProperty]
    private string _companySlug = string.Empty;

    [ObservableProperty]
    private string _companyEmail = string.Empty;

    [ObservableProperty]
    private string _adminEmail = string.Empty;

    [ObservableProperty]
    private string _adminPassword = string.Empty;

    [ObservableProperty]
    private string _confirmPassword = string.Empty;

    public RegisterViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Registra Azienda";
    }

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (IsBusy) return;

        if (string.IsNullOrWhiteSpace(CompanyName) ||
            string.IsNullOrWhiteSpace(CompanySlug) ||
            string.IsNullOrWhiteSpace(CompanyEmail) ||
            string.IsNullOrWhiteSpace(AdminEmail) ||
            string.IsNullOrWhiteSpace(AdminPassword))
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Compila tutti i campi.", "OK");
            return;
        }

        if (AdminPassword != ConfirmPassword)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Le password non coincidono.", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            var request = new RegisterRequestDto
            {
                CompanyName = CompanyName,
                CompanySlug = CompanySlug,
                CompanyEmail = CompanyEmail,
                AdminEmail = AdminEmail,
                AdminPassword = AdminPassword
            };

            var response = await _httpClient.PostAsJsonAsync("api/auth/register", request);

            if (response.IsSuccessStatusCode)
            {
                if (App.Current?.MainPage != null)
                    await App.Current.MainPage.DisplayAlert("Successo", "Azienda registrata correttamente! Ora puoi accedere.", "OK");
                
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                if (App.Current?.MainPage != null)
                    await App.Current.MainPage.DisplayAlert("Errore", "Registrazione fallita. Potrebbe esistere già un'azienda con lo stesso Slug o Email.", "OK");
            }
        }
        catch (Exception)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Impossibile contattare il server.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task GoBackAsync()
    {
        await Shell.Current.GoToAsync("..");
    }
}
