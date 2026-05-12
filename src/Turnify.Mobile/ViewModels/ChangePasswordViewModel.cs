using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;

namespace Turnify.Mobile.ViewModels;

public partial class ChangePasswordViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private string _currentPassword = string.Empty;
    [ObservableProperty] private string _newPassword     = string.Empty;
    [ObservableProperty] private string _confirmPassword = string.Empty;
    [ObservableProperty] private string _errorMessage    = string.Empty;
    [ObservableProperty] private bool   _hasError;

    public ChangePasswordViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title       = "Cambia Password";
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        HasError     = false;
        ErrorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(CurrentPassword))
        {
            HasError     = true;
            ErrorMessage = "Inserisci la password attuale.";
            return;
        }

        if (NewPassword.Length < 8 ||
            !System.Linq.Enumerable.Any(NewPassword, char.IsUpper) ||
            !System.Linq.Enumerable.Any(NewPassword, char.IsDigit))
        {
            HasError     = true;
            ErrorMessage = "La nuova password deve avere almeno 8 caratteri, una maiuscola e un numero.";
            return;
        }

        if (NewPassword != ConfirmPassword)
        {
            HasError     = true;
            ErrorMessage = "Le password non coincidono.";
            return;
        }

        try
        {
            IsBusy = true;
            var response = await _httpClient.PutAsJsonAsync(
                "api/users/me/password",
                new { currentPassword = CurrentPassword, newPassword = NewPassword });

            if (response.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync("Successo", "Password aggiornata.", "OK");
                await Shell.Current.GoToAsync("..");
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                HasError     = true;
                ErrorMessage = "Password attuale non corretta.";
            }
            else
            {
                HasError     = true;
                ErrorMessage = "Errore durante l'aggiornamento. Riprova.";
            }
        }
        catch (HttpRequestException)
        {
            HasError     = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (TaskCanceledException)
        {
            HasError     = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task CancelAsync() => await Shell.Current.GoToAsync("..");
}
