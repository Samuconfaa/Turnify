using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using Turnify.Core.Interfaces.Services;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.ViewModels;

public partial class LoginViewModel : BaseViewModel
{
    private readonly IAuthService _authService;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _email = string.Empty;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(LoginCommand))]
    private string _password = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public LoginViewModel(IAuthService authService)
    {
        _authService = authService;
        Title        = "Login";
    }

    private bool CanLogin() =>
        !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);

    [RelayCommand(CanExecute = nameof(CanLogin))]
    private async Task LoginAsync()
    {
        ErrorMessage = string.Empty;
        IsBusy       = true;

        try
        {
            var result = await _authService.LoginAsync(Email, Password);
            if (result == null)
            {
                ErrorMessage = "Credenziali non valide. Verifica email e password.";
                return;
            }

            bool isAdmin = ExtractIsAdminFromToken(result.Value.AccessToken);

            // Salva ruolo e flag sessione per il prossimo avvio
            await SecureStorage.Default.SetAsync("user_role", isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("user_role_cached",   isAdmin ? "Admin" : "Employee");
            Preferences.Default.Set("has_valid_session",  true);

            // Admin al primo accesso → mostra onboarding wizard
            if (isAdmin && OnboardingViewModel.NeedsOnboarding())
            {
                Application.Current!.Windows[0].Page = new AppShell(isAdmin: true, startRoute: "Login");
                await Shell.Current.GoToAsync(nameof(Views.OnboardingPage));
                return;
            }

            // Accesso normale
            Application.Current!.Windows[0].Page = new AppShell(isAdmin);
            if (isAdmin)
                await Shell.Current.GoToAsync("//Dashboard");
            else
                await Shell.Current.GoToAsync(nameof(Views.EmployeeDashboardPage));
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
    private async Task GoToRegisterAsync()
        => await Shell.Current.GoToAsync(nameof(Views.RegisterPage));

    [RelayCommand]
    private async Task GoToForgotPasswordAsync()
        => await Shell.Current.GoToAsync(nameof(Views.ForgotPasswordPage));
}
