using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using System.Net.Http;
using System.Net.Http.Json;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Turnify.Mobile.Services;

namespace Turnify.Mobile.ViewModels;

public partial class ProfileViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;
    private readonly IAppNavigationService _appNavigation;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(FullName))]
    [NotifyPropertyChangedFor(nameof(ComputedInitials))]
    private string _firstName = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(FullName))]
    [NotifyPropertyChangedFor(nameof(ComputedInitials))]
    private string _lastName = string.Empty;

    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _role = string.Empty;
    [ObservableProperty] private string _roleDisplay = string.Empty;
    [ObservableProperty] private bool _isAdmin;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;

    // Avatar state
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(ShowPhoto))]
    [NotifyPropertyChangedFor(nameof(ShowEmoji))]
    [NotifyPropertyChangedFor(nameof(ShowInitials))]
    private string _avatarEmoji = string.Empty;   // set when user picks emoji

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(ShowPhoto))]
    [NotifyPropertyChangedFor(nameof(ShowEmoji))]
    [NotifyPropertyChangedFor(nameof(ShowInitials))]
    private ImageSource? _avatarPhoto;             // set when user picks photo

    public bool ShowPhoto    => AvatarPhoto != null;
    public bool ShowEmoji    => !ShowPhoto && !string.IsNullOrEmpty(AvatarEmoji);
    public bool ShowInitials => !ShowPhoto && !ShowEmoji;

    public string FullName
    {
        get
        {
            var name = $"{FirstName} {LastName}".Trim();
            return string.IsNullOrWhiteSpace(name) ? Email : name;
        }
    }

    public string ComputedInitials
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

    [ObservableProperty] private string? _selectedEmoji;

    partial void OnSelectedEmojiChanged(string? value)
    {
        if (string.IsNullOrEmpty(value)) return;
        SetEmoji(value);
        SelectedEmoji = null;
        _ = Shell.Current.GoToAsync("..");
    }

    // Emoji grid for picker (4 per row)
    public string[] AvailableEmojis { get; } =
    {
        "😀","😎","🧑","👨","👩","🧔","👴","👵",
        "🐶","🐱","🦊","🐼","🐨","🦁","🐯","🐻",
        "🌟","⚡","🔥","🌈","🎯","🎸","🏆","🚀"
    };

    public ProfileViewModel(IHttpClientFactory httpClientFactory, IAppNavigationService appNavigation)
    {
        _httpClient    = httpClientFactory.CreateClient("TurnifyApi");
        _appNavigation = appNavigation;
        Title          = "Profilo";
    }

    public async Task OnAppearingAsync()
    {
        await LoadProfileAsync();
        LoadSavedAvatar();
    }

    private void LoadSavedAvatar()
    {
        var savedEmoji = Preferences.Default.Get("avatar_emoji", string.Empty);
        if (!string.IsNullOrEmpty(savedEmoji))
            AvatarEmoji = savedEmoji;
    }

    [RelayCommand]
    private async Task GoToReportsAsync()
        => await Shell.Current.GoToAsync(nameof(Views.ReportsPage));

    [RelayCommand]
    private async Task GoToEmployeeReportsAsync()
        => await Shell.Current.GoToAsync(nameof(Views.EmployeeReportsPage));

    private async Task LoadProfileAsync()
    {
        HasError = false;
        ErrorMessage = string.Empty;
        IsBusy = true;
        try
        {
            var user = await _httpClient.GetFromJsonAsync<UserMeResponse>("api/users/me");
            if (user == null)
            {
                HasData = false;
                IsEmptyState = true;
                return;
            }
            Email     = user.Email     ?? string.Empty;
            FirstName = user.FirstName ?? string.Empty;
            LastName  = user.LastName  ?? string.Empty;
            Role      = user.Role      ?? string.Empty;
            IsAdmin     = Role == "Admin";
            RoleDisplay = IsAdmin ? "Amministratore" : "Dipendente";
            OnPropertyChanged(nameof(FullName));
            OnPropertyChanged(nameof(ComputedInitials));
            HasData      = true;
            IsEmptyState = false;

            // Sync emoji from server (server wins over local Preferences)
            if (!string.IsNullOrEmpty(user.AvatarEmoji))
            {
                AvatarEmoji = user.AvatarEmoji;
                Preferences.Default.Set("avatar_emoji", user.AvatarEmoji);
            }
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
            var storedRole = await SecureStorage.Default.GetAsync("user_role");
            if (!string.IsNullOrEmpty(storedRole))
            {
                Role = storedRole;
                IsAdmin = storedRole == "Admin";
                RoleDisplay = IsAdmin ? "Amministratore" : "Dipendente";
            }
        }
        catch (JsonException ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ProfileViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    // ── Avatar commands ────────────────────────────────────────────

    [RelayCommand]
    private async Task PickAvatarAsync()
    {
        var choice = await Shell.Current.DisplayActionSheetAsync(
            "Cambia foto profilo", "Annulla", null,
            "Scegli emoji", "Carica foto dalla galleria");

        if (choice == "Scegli emoji")
            await PickEmojiAsync();
        else if (choice == "Carica foto dalla galleria")
            await PickPhotoAsync();
    }

    private async Task PickEmojiAsync()
    {
        // Navigate to emoji picker page
        await Shell.Current.GoToAsync(nameof(Views.EmojiPickerPage));
    }

    // Called by EmojiPickerPage when user confirms selection
    public void SetEmoji(string emoji)
    {
        AvatarEmoji = emoji;
        AvatarPhoto = null;
        Preferences.Default.Set("avatar_emoji", emoji);
        Preferences.Default.Set("avatar_photo_path", string.Empty);
        _ = SyncAvatarEmojiToServerAsync(emoji);
    }

    private async Task SyncAvatarEmojiToServerAsync(string emoji)
    {
        try
        {
            await _httpClient.PutAsJsonAsync("api/users/me/avatar-emoji", new { avatarEmoji = emoji });
        }
        catch (HttpRequestException) { }
        catch (TaskCanceledException) { }
    }

    private async Task PickPhotoAsync()
    {
        try
        {
            var photos = await MediaPicker.Default.PickPhotosAsync(new MediaPickerOptions
            {
                Title = "Scegli foto profilo"
            });
            var result = photos?.FirstOrDefault();

            if (result == null) return;

            // Save path and load as ImageSource
            Preferences.Default.Set("avatar_photo_path", result.FullPath);
            Preferences.Default.Set("avatar_emoji", string.Empty);

            AvatarEmoji = string.Empty;
            AvatarPhoto = ImageSource.FromFile(result.FullPath);
        }
        catch
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Impossibile caricare la foto.", "OK");
        }
    }

    // ── Account commands ───────────────────────────────────────────

    [RelayCommand]
    private async Task ChangePasswordAsync()
        => await Shell.Current.GoToAsync(nameof(Views.ChangePasswordPage));

    [RelayCommand]
    private async Task ManageOpeningHoursAsync()
    {
        if (!IsAdmin) return;
        try
        {
            var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("api/businesses");
            if (businesses == null || businesses.Length == 0)
            {
                bool create = await Shell.Current.DisplayAlertAsync(
                    "Nessuna attività",
                    "Non hai ancora creato nessuna attività. Vuoi crearne una adesso?",
                    "Sì", "No");
                if (create)
                    await Shell.Current.GoToAsync(nameof(Views.BusinessDetailPage));
                return;
            }
            if (businesses.Length == 1)
            {
                await Shell.Current.GoToAsync(
                    $"{nameof(Views.BusinessOpeningHoursPage)}?businessId={businesses[0].Id}");
            }
            else
            {
                var names = businesses.Select(b => b.Name).ToArray();
                var chosen = await Shell.Current.DisplayActionSheetAsync(
                    "Seleziona attività", "Annulla", null, names);
                var biz = businesses.FirstOrDefault(b => b.Name == chosen);
                if (biz != null)
                    await Shell.Current.GoToAsync(
                        $"{nameof(Views.BusinessOpeningHoursPage)}?businessId={biz.Id}");
            }
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (JsonException) { await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
    }

    [RelayCommand]
    private async Task GoToTeamAsync() =>
        await Shell.Current.GoToAsync("//Team");

    [RelayCommand]
    private async Task CloseAsync() =>
        await Shell.Current.GoToAsync("..");

    [RelayCommand]
    private async Task ManageBusinessesAsync()
    {
        await Shell.Current.GoToAsync(nameof(Views.BusinessListPage));
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        bool confirm = await Shell.Current.DisplayAlertAsync("Logout", "Sei sicuro?", "Esci", "Annulla");
        if (!confirm) return;
        try { await _httpClient.PostAsync("api/auth/logout", null); }
        catch (HttpRequestException) { }
        catch (TaskCanceledException) { }
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("refresh_token");
        SecureStorage.Default.Remove("user_role");
        await _appNavigation.NavigateToShellAsync(isAdmin: false, startRoute: "Login");
    }

    private class UserMeResponse
    {
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? AvatarEmoji { get; set; }
    }

    private class BusinessItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
