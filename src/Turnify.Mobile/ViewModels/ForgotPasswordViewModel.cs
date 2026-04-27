using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;

namespace Turnify.Mobile.ViewModels;

public partial class ForgotPasswordViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(SendResetCommand))]
    private string _email = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage = string.Empty;

    [ObservableProperty] private bool _emailSent;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public ForgotPasswordViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title       = "Password dimenticata";
    }

    private bool CanSend() => !string.IsNullOrWhiteSpace(Email) && Email.Contains('@');

    [RelayCommand(CanExecute = nameof(CanSend))]
    private async Task SendResetAsync()
    {
        ErrorMessage = string.Empty;
        IsBusy       = true;
        try
        {
            var resp = await _httpClient.PostAsJsonAsync(
                "api/auth/forgot-password", new { email = Email });

            // Risposta sempre 200 per non rivelare se l'email esiste
            EmailSent = true;
        }
        catch (HttpRequestException)
        {
            ErrorMessage = "Errore di connessione. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task GoBackAsync()
        => await Shell.Current.GoToAsync("..");
}
