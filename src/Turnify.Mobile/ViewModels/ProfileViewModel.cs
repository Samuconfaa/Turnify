using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Turnify.Mobile.ViewModels;

public partial class ProfileViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(FullName))]
    [NotifyPropertyChangedFor(nameof(Initials))]
    private string _firstName = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(FullName))]
    [NotifyPropertyChangedFor(nameof(Initials))]
    private string _lastName = string.Empty;

    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _role = string.Empty;
    [ObservableProperty] private string _roleDisplay = string.Empty;
    [ObservableProperty] private bool _isAdmin;

    public string FullName
    {
        get
        {
            var name = $"{FirstName} {LastName}".Trim();
            return string.IsNullOrWhiteSpace(name) ? Email : name;
        }
    }

    public string Initials
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(LastName))
                return $"{FirstName[0]}{LastName[0]}".ToUpper();
            if (!string.IsNullOrWhiteSpace(FirstName))
                return FirstName[0].ToString().ToUpper();
            if (!string.IsNullOrWhiteSpace(LastName))
                return LastName[0].ToString().ToUpper();
            if (!string.IsNullOrWhiteSpace(Email) && Email.Length > 0)
                return Email[0].ToString().ToUpper();
            return "?";
        }
    }

    public ProfileViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
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
            var user = await _httpClient.GetFromJsonAsync<UserMeResponse>("api/users/me");
            if (user == null) return;

            Email = user.Email ?? string.Empty;
            FirstName = user.FirstName ?? string.Empty;
            LastName = user.LastName ?? string.Empty;
            Role = user.Role ?? string.Empty;
            IsAdmin = Role == "Admin";
            RoleDisplay = IsAdmin ? "Amministratore" : "Dipendente";

            // Notify computed properties
            OnPropertyChanged(nameof(FullName));
            OnPropertyChanged(nameof(Initials));
        }
        catch
        {
            // Fallback: read role from SecureStorage
            var storedRole = await SecureStorage.Default.GetAsync("user_role");
            if (!string.IsNullOrEmpty(storedRole))
            {
                Role = storedRole;
                IsAdmin = storedRole == "Admin";
                RoleDisplay = IsAdmin ? "Amministratore" : "Dipendente";
            }
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task ChangePasswordAsync()
    {
        var current = await Shell.Current.DisplayPromptAsync(
            "Cambia Password", "Inserisci la password attuale:", "Avanti", "Annulla");
        if (current == null) return;

        var newPwd = await Shell.Current.DisplayPromptAsync(
            "Cambia Password", "Inserisci la nuova password (min. 8 caratteri):", "Conferma", "Annulla");
        if (string.IsNullOrEmpty(newPwd) || newPwd.Length < 8)
        {
            await Shell.Current.DisplayAlert("Errore", "La password deve avere almeno 8 caratteri.", "OK");
            return;
        }

        try
        {
            var response = await _httpClient.PutAsJsonAsync("api/users/me/password", new
            {
                currentPassword = current,
                newPassword = newPwd
            });

            if (response.IsSuccessStatusCode)
                await Shell.Current.DisplayAlert("Successo", "Password aggiornata correttamente.", "OK");
            else
                await Shell.Current.DisplayAlert("Errore", "Password attuale non corretta.", "OK");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
    }

    // Fix 7: Navigate to opening hours management (admin only)
    [RelayCommand]
    private async Task ManageOpeningHoursAsync()
    {
        if (!IsAdmin) return;

        // Load first business and navigate
        try
        {
            var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("api/businesses");
            if (businesses == null || businesses.Length == 0)
            {
                await Shell.Current.DisplayAlert("Info", "Nessuna attività trovata. Crea prima un'attività.", "OK");
                return;
            }

            if (businesses.Length == 1)
            {
                await Shell.Current.GoToAsync(
                    $"{nameof(Views.BusinessOpeningHoursPage)}?businessId={businesses[0].Id}");
            }
            else
            {
                // Let the user pick which business
                var names = businesses.Select(b => b.Name).ToArray();
                var chosen = await Shell.Current.DisplayActionSheet(
                    "Seleziona attività", "Annulla", null, names);
                var biz = businesses.FirstOrDefault(b => b.Name == chosen);
                if (biz != null)
                    await Shell.Current.GoToAsync(
                        $"{nameof(Views.BusinessOpeningHoursPage)}?businessId={biz.Id}");
            }
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Impossibile caricare le attività.", "OK");
        }
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        bool confirm = await Shell.Current.DisplayAlert(
            "Logout", "Sei sicuro di voler uscire?", "Esci", "Annulla");
        if (!confirm) return;

        try
        {
            await _httpClient.PostAsync("api/auth/logout", null);
        }
        catch { }
        finally
        {
            SecureStorage.Default.Remove("jwt_token");
            SecureStorage.Default.Remove("refresh_token");
            SecureStorage.Default.Remove("user_role");
            Application.Current!.MainPage = new AppShell();
        }
    }

    private class UserMeResponse
    {
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    private class BusinessItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
