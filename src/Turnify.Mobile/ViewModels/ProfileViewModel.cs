using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using System.Data;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Turnify.Mobile.ViewModels;

public partial class ProfileViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _role = string.Empty;
    [ObservableProperty] private string _initials = "??";
    [ObservableProperty] private bool _isPushEnabled = true;
    [ObservableProperty] private bool _isEmailEnabled = false;

    public ProfileViewModel(HttpClient httpClient)
    {
        _httpClient = httpClient;
        Title = "Profilo";
    }

    public async Task OnAppearingAsync()
    {
        await LoadProfileAsync();
    }

    private async Task LoadProfileAsync()
    {
        IsBusy = true;
        try
        {
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            if (string.IsNullOrEmpty(token)) return;

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var user = await _httpClient.GetFromJsonAsync<UserMeResponse>("api/users/me");
            if (user == null) return;

            Email = user.Email;
            Role = user.Role;
            FirstName = user.Email.Split('@')[0]; // placeholder finché non hai endpoint nome
            LastName = string.Empty;
            Initials = FirstName.Length > 0
                ? FirstName[0].ToString().ToUpper()
                : "?";
        }
        catch { }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task ChangePasswordAsync()
    {
        var current = await Shell.Current.DisplayPromptAsync(
            "Cambia Password", "Password attuale:", "Avanti", "Annulla");

        var newPwd = await Shell.Current.DisplayPromptAsync(
            "Cambia Password", "Nuova password (min 8 caratteri):", "Conferma", "Annulla");
        if (string.IsNullOrEmpty(newPwd) || newPwd.Length < 8)
        {
            await Shell.Current.DisplayAlert("Errore", "La password deve essere di almeno 8 caratteri.", "OK");
            return;
        }

        try
        {
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.PutAsJsonAsync("api/users/me/password", new
            {
                currentPassword = current,
                newPassword = newPwd
            });

            if (response.IsSuccessStatusCode)
                await Shell.Current.DisplayAlert("Successo", "Password aggiornata.", "OK");
            else
                await Shell.Current.DisplayAlert("Errore", "Password attuale non corretta.", "OK");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
    }

    [RelayCommand]
    private async Task EditProfileAsync()
    {
        await Shell.Current.DisplayAlert("Info", "Modifica profilo — prossimamente", "OK");
    }

    [RelayCommand]
    private async Task OpenNotificationsAsync()
    {
        await Shell.Current.DisplayAlert("Info", "Preferenze notifiche — prossimamente", "OK");
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        bool confirm = await Shell.Current.DisplayAlert(
            "Logout", "Sei sicuro di voler uscire?", "Esci", "Annulla");
        if (!confirm) return;

        try
        {
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);
                await _httpClient.PostAsync("api/auth/logout", null);
            }
        }
        catch { }
        finally
        {
            SecureStorage.Default.Remove("jwt_token");
            SecureStorage.Default.Remove("refresh_token");
            Application.Current!.MainPage = new AppShell();
        }
    }

    private class UserMeResponse
    {
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}