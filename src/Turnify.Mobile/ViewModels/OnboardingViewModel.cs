using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class OnboardingViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public const string ONBOARDING_DONE_KEY = "onboarding_completed";

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsStep1))]
    [NotifyPropertyChangedFor(nameof(IsStep2))]
    [NotifyPropertyChangedFor(nameof(IsStep3))]
    [NotifyPropertyChangedFor(nameof(Step1Dot))]
    [NotifyPropertyChangedFor(nameof(Step2Dot))]
    [NotifyPropertyChangedFor(nameof(Step3Dot))]
    private int _currentStep = 1;

    public bool IsStep1  => CurrentStep == 1;
    public bool IsStep2  => CurrentStep == 2;
    public bool IsStep3  => CurrentStep == 3;
    public bool Step1Dot => CurrentStep >= 1;
    public bool Step2Dot => CurrentStep >= 2;
    public bool Step3Dot => CurrentStep >= 3;

    // Step 2
    [ObservableProperty] private string _businessName    = string.Empty;
    [ObservableProperty] private string _businessType    = string.Empty;
    [ObservableProperty] private string _businessAddress = string.Empty;

    public string[] BusinessTypes { get; } =
    {
        "Ristorante", "Bar", "Pizzeria", "Gelateria",
        "Negozio", "Palestra", "Parrucchiere", "Altro"
    };

    // Step 3
    [ObservableProperty] private string _employeeFirstName = string.Empty;
    [ObservableProperty] private string _employeeLastName  = string.Empty;
    [ObservableProperty] private string _employeeEmail     = string.Empty;
    [ObservableProperty] private string _employeePassword  = string.Empty;

    public OnboardingViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Configura Turnify";
    }

    public static bool NeedsOnboarding()
        => !Preferences.Default.Get(ONBOARDING_DONE_KEY, false);

    [RelayCommand]
    private void NextStep()
    {
        if (CurrentStep < 3) CurrentStep++;
    }

    [RelayCommand]
    private void PreviousStep()
    {
        if (CurrentStep > 1) CurrentStep--;
    }

    [RelayCommand]
    private void GoToStep2() => CurrentStep = 2;

    [RelayCommand]
    private async Task SaveBusinessAndContinueAsync()
    {
        if (string.IsNullOrWhiteSpace(BusinessName))
        {
            await Shell.Current.DisplayAlert("Errore",
                "Il nome dell'attività è obbligatorio.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var response = await _httpClient.PostAsJsonAsync("api/businesses", new
            {
                name         = BusinessName,
                businessType = BusinessType,
                address      = BusinessAddress,
                isActive     = true
            });

            if (response.IsSuccessStatusCode)
                CurrentStep = 3;
            else
                await Shell.Current.DisplayAlert("Errore",
                    "Impossibile salvare l'attività. Riprova.", "OK");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveEmployeeAndCompleteAsync()
    {
        if (string.IsNullOrWhiteSpace(EmployeeFirstName) ||
            string.IsNullOrWhiteSpace(EmployeeLastName)  ||
            string.IsNullOrWhiteSpace(EmployeeEmail)     ||
            string.IsNullOrWhiteSpace(EmployeePassword))
        {
            await Shell.Current.DisplayAlert("Errore",
                "Tutti i campi del dipendente sono obbligatori.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var response = await _httpClient.PostAsJsonAsync("api/employees", new
            {
                firstName = EmployeeFirstName,
                lastName  = EmployeeLastName,
                email     = EmployeeEmail,
                password  = EmployeePassword,
                isActive  = true
            });

            if (response.IsSuccessStatusCode)
                await CompleteOnboardingAsync();
            else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                await Shell.Current.DisplayAlert("Errore",
                    "Email già in uso. Usa un'altra email.", "OK");
            else
                await Shell.Current.DisplayAlert("Errore",
                    "Impossibile creare il dipendente. Riprova.", "OK");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SkipEmployeeAsync() => await CompleteOnboardingAsync();

    [RelayCommand]
    private async Task SkipOnboardingAsync() => await CompleteOnboardingAsync();

    private async Task CompleteOnboardingAsync()
    {
        Preferences.Default.Set(ONBOARDING_DONE_KEY, true);

        var storedRole = await SecureStorage.Default.GetAsync("user_role");
        bool isAdmin   = storedRole == "Admin";

        Application.Current!.MainPage = new AppShell(isAdmin);
        await Shell.Current.GoToAsync(isAdmin ? "//Dashboard" : "//Shifts");
    }
}
