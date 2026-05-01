using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Turnify.Mobile.Services;

namespace Turnify.Mobile.ViewModels;

public partial class InviteCodeViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;
    private readonly IAppNavigationService _appNavigation;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(RedeemCommand))]
    private string _code = string.Empty;

    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasError;

    public InviteCodeViewModel(IHttpClientFactory httpClientFactory, IAppNavigationService appNavigation)
    {
        _httpClient    = httpClientFactory.CreateClient("TurnifyApi");
        _appNavigation = appNavigation;
        Title = "Codice Invito";
    }

    private bool CanRedeem() => !string.IsNullOrWhiteSpace(Code) && Code.Length >= 4;

    [RelayCommand(CanExecute = nameof(CanRedeem))]
    private async Task RedeemAsync()
    {
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var resp = await _httpClient.PostAsJsonAsync("api/invites/redeem", new { code = Code.Trim().ToUpperInvariant() });
            if (resp.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync(
                    "✅ Associazione completata!",
                    "Sei stato associato all'azienda con successo. " +
                    "Ora puoi accedere a tutti i tuoi turni.",
                    "Continua");
                await _appNavigation.NavigateToShellAsync(isAdmin: false, startRoute: "Main");
            }
            else if (resp.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                var body = await resp.Content.ReadFromJsonAsync<ErrorBody>();
                HasError = true;
                ErrorMessage = body?.Message ?? "Codice non valido o scaduto.";
            }
            else
            {
                HasError = true;
                ErrorMessage = "Errore del server. Riprova.";
            }
        }
        catch (HttpRequestException)
        {
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (TaskCanceledException)
        {
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SkipAsync()
        => await _appNavigation.NavigateToShellAsync(isAdmin: false, startRoute: "Main");

    private record ErrorBody(string Message);
}
