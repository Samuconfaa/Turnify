using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class GdprConsentViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public const string CONSENT_GIVEN_KEY   = "gdpr_consent_given";
    public const string CONSENT_VERSION_KEY = "gdpr_consent_version";
    public const string CURRENT_CONSENT_VER = "1.0";

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CanProceed))]
    private bool _privacyAccepted;

    [ObservableProperty]
    private bool _marketingAccepted;

    public bool CanProceed => PrivacyAccepted;

    public GdprConsentViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Privacy e Consenso";
    }

    public static bool NeedsConsent()
    {
        var given   = Preferences.Default.Get(CONSENT_GIVEN_KEY, false);
        var version = Preferences.Default.Get(CONSENT_VERSION_KEY, string.Empty);
        return !given || version != CURRENT_CONSENT_VER;
    }

    [RelayCommand(CanExecute = nameof(CanProceed))]
    private async Task AcceptAndContinueAsync()
    {
        // Salva consenso
        Preferences.Default.Set(CONSENT_GIVEN_KEY,    true);
        Preferences.Default.Set(CONSENT_VERSION_KEY,  CURRENT_CONSENT_VER);
        Preferences.Default.Set("gdpr_marketing_accepted", MarketingAccepted);
        Preferences.Default.Set("gdpr_consent_date",  DateTime.UtcNow.ToString("O"));

        // Dopo il consenso GDPR → sempre LoginPage
        // L'utente da lì può fare login (se ha già un account)
        // oppure toccare "Registra la tua azienda" per creare un nuovo account
        Application.Current!.MainPage = new AppShell(isAdmin: false, startRoute: "Login");
    }

    [RelayCommand]
    private async Task OpenPrivacyPolicyAsync()
    {
        await Browser.Default.OpenAsync(
            new Uri("https://turnify.it/privacy-policy"),
            BrowserLaunchMode.SystemPreferred);
    }

    [RelayCommand]
    private async Task OpenTermsOfServiceAsync()
    {
        await Browser.Default.OpenAsync(
            new Uri("https://turnify.it/terms-of-service"),
            BrowserLaunchMode.SystemPreferred);
    }

    // ── Gestione dati (GDPR Art. 17 / 20) ────────────────────────

    [RelayCommand]
    private async Task ExportDataAsync()
    {
        try
        {
            IsBusy = true;
            await Browser.Default.OpenAsync(
                new Uri("https://samuconfa.it/turnify/api/users/me/export-data"),
                BrowserLaunchMode.SystemPreferred);
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore",
                "Impossibile avviare l'esportazione dati.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task RequestAccountDeletionAsync()
    {
        var confirm1 = await Shell.Current.DisplayAlert(
            "Elimina account",
            "Vuoi eliminare il tuo account? Tutti i tuoi dati personali saranno rimossi " +
            "entro 30 giorni come previsto dal GDPR.\n\n" +
            "I turni e le ferie storici associati alla tua azienda saranno anonimizzati.",
            "Continua", "Annulla");
        if (!confirm1) return;

        var confirm2 = await Shell.Current.DisplayAlert(
            "Conferma eliminazione",
            "Questa operazione è irreversibile. Sei sicuro?",
            "Sì, elimina il mio account", "Annulla");
        if (!confirm2) return;

        try
        {
            IsBusy = true;
            var response = await _httpClient.PostAsync("api/users/me/request-deletion", null);

            if (response.IsSuccessStatusCode)
            {
                SecureStorage.Default.Remove("jwt_token");
                SecureStorage.Default.Remove("refresh_token");
                Preferences.Default.Remove("user_role_cached");
                Preferences.Default.Remove("has_valid_session");
                Preferences.Default.Remove(CONSENT_GIVEN_KEY);
                Preferences.Default.Remove(CONSENT_VERSION_KEY);

                await Shell.Current.DisplayAlert(
                    "Richiesta inviata",
                    "I tuoi dati saranno rimossi entro 30 giorni. " +
                    "Riceverai una email di conferma.",
                    "OK");

                Application.Current!.MainPage = new AppShell(isAdmin: false, startRoute: "Login");
            }
            else
            {
                await Shell.Current.DisplayAlert("Errore",
                    "Impossibile completare la richiesta. Contatta privacy@turnify.it", "OK");
            }
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
        finally { IsBusy = false; }
    }
}
