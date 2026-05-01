using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using Turnify.Core.Interfaces.Services;
using Turnify.Mobile.Services;

namespace Turnify.Mobile.ViewModels;

public partial class LoginViewModel : BaseViewModel
{
    private readonly IAuthService _authService;
    private readonly IAppNavigationService _appNavigation;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    [NotifyPropertyChangedFor(nameof(IsAdminMode))]
    private bool _isEmployeeMode;

    public bool IsAdminMode => !IsEmployeeMode;

    // Campi admin
    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _email = string.Empty;

    // Campi dipendente
    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _companySlug = string.Empty;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _username = string.Empty;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _password = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public LoginViewModel(IAuthService authService, IAppNavigationService appNavigation)
    {
        _authService   = authService;
        _appNavigation = appNavigation;
        Title          = "Login";
    }

    private bool CanLogin()
    {
        if (IsEmployeeMode)
            return !string.IsNullOrWhiteSpace(CompanySlug)
                && !string.IsNullOrWhiteSpace(Username)
                && !string.IsNullOrWhiteSpace(Password);
        return !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
    }

    [RelayCommand(CanExecute = nameof(CanLogin))]
    private async Task LoginAsync()
    {
        ErrorMessage = string.Empty;
        IsBusy       = true;

        try
        {
            (string AccessToken, string RefreshToken)? result;

            if (IsEmployeeMode)
            {
                result = await _authService.EmployeeLoginAsync(CompanySlug.Trim(), Username.Trim(), Password);
                if (result == null)
                {
                    ErrorMessage = "Credenziali non valide. Verifica azienda, nome utente e password.";
                    return;
                }
            }
            else
            {
                result = await _authService.LoginAsync(Email, Password);
                if (result == null)
                {
                    ErrorMessage = "Credenziali non valide. Verifica email e password.";
                    return;
                }
            }

            bool isAdmin = ExtractIsAdminFromToken(result.Value.AccessToken);

            // Salva ruolo e flag sessione per il prossimo avvio
            await SecureStorage.Default.SetAsync("user_role", isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("user_role_cached",   isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("has_valid_session",  true);

            // Admin al primo accesso → mostra onboarding wizard
            if (isAdmin && OnboardingViewModel.NeedsOnboarding())
            {
                await _appNavigation.NavigateToShellAsync(isAdmin: true, startRoute: "Onboarding");
                return;
            }

            // Accesso normale
            await _appNavigation.NavigateToShellAsync(isAdmin, startRoute: "Main");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            ErrorMessage = "Troppi tentativi. Riprova tra qualche minuto.";
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (Exception ex)
        {
            ErrorMessage = "Si è verificato un errore. Riprova.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(LoginViewModel));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private static bool ExtractIsAdminFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt     = handler.ReadJwtToken(token);
            var role    = jwt.Claims
                .FirstOrDefault(c =>
                    c.Type == "role" ||
                    c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                ?.Value;
            return role == "Admin";
        }
        catch { return false; }
    }

    [RelayCommand]
    private void SelectAdminMode() => IsEmployeeMode = false;

    [RelayCommand]
    private void SelectEmployeeMode() => IsEmployeeMode = true;

    [RelayCommand]
    private async Task GoToRegisterAsync()
        => await Shell.Current.GoToAsync(nameof(Views.RegisterPage));

    [RelayCommand]
    private async Task GoToForgotPasswordAsync()
        => await Shell.Current.GoToAsync(nameof(Views.ForgotPasswordPage));
}
