using System.Net.Http;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Turnify.Core.Interfaces.Services;

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
        Title = "Login";
    }

    private bool CanLogin()
    {
        return !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
    }

    [RelayCommand(CanExecute = nameof(CanLogin))]
    private async Task LoginAsync()
    {
        ErrorMessage = string.Empty;
        IsBusy = true;

        try
        {
            var result = await _authService.LoginAsync(Email, Password);
            if (result != null)
            {
                // Qui in futuro leggeremo i claims dal JWT per impostare il ruolo (es. Admin o Dipendente)
                // Per ora simuliamo
                if (Application.Current?.MainPage is AppShell shell)
                {
                    shell.ConfigureForRole(isAdmin: true); 
                }
                
                await Shell.Current.GoToAsync("//Dashboard");
            }
            else
            {
                ErrorMessage = "Credenziali non valide";
            }
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Errore di connessione";
        }
        catch (System.Exception)
        {
            ErrorMessage = "Errore di connessione";
        }
        finally
        {
            IsBusy = false;
        }
    }
}
