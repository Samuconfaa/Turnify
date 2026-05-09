using System.Collections.Generic;
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

public partial class LoginViewModel : BaseViewModel, IQueryAttributable
{
    private readonly IAuthService _authService;
    private readonly IAppNavigationService _appNavigation;
    private readonly IMobilePushService _pushService;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    [NotifyPropertyChangedFor(nameof(IsAdminMode))]
    [NotifyPropertyChangedFor(nameof(LoginTitle))]
    private bool _isEmployeeMode;

    public bool IsAdminMode  => !IsEmployeeMode;
    public string LoginTitle => IsEmployeeMode ? "Accedi come Dipendente" : "Accedi come Admin";

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

    public LoginViewModel(IAuthService authService, IAppNavigationService appNavigation, IMobilePushService pushService)
    {
        _authService   = authService;
        _appNavigation = appNavigation;
        _pushService   = pushService;
        Title          = "Login";
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("isEmployee", out var val))
            IsEmployeeMode = val?.ToString()?.ToLower() == "true";

        // Reset stato al ritorno sulla pagina
        ErrorMessage = string.Empty;
        Password     = string.Empty;
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
                result = await _authService.LoginAsync(Email.Trim(), Password);
                if (result == null)
                {
                    ErrorMessage = "Credenziali non valide. Verifica email e password.";
                    return;
                }
            }

            bool isAdmin = ExtractIsAdminFromToken(result.Value.AccessToken);

            await SecureStorage.Default.SetAsync("user_role", isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("user_role_cached",  isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("has_valid_session", true);

            _ = _pushService.RegisterAsync();

            if (isAdmin && OnboardingViewModel.NeedsOnboarding())
            {
                await _appNavigation.NavigateToShellAsync(isAdmin: true, startRoute: "Onboarding");
                return;
            }

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
    private async Task GoBackAsync()
        => await Shell.Current.GoToAsync("..");

    [RelayCommand]
    private async Task GoToRegisterAsync()
        => await Shell.Current.GoToAsync(nameof(Views.RegisterPage));

    [RelayCommand]
    private async Task GoToForgotPasswordAsync()
        => await Shell.Current.GoToAsync(nameof(Views.ForgotPasswordPage));
}
