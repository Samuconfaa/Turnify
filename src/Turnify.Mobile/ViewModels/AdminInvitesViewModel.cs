using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;

namespace Turnify.Mobile.ViewModels;

public partial class AdminInvitesViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _isRefreshing;

    public ObservableCollection<InviteDto> Invites { get; } = new();

    public AdminInvitesViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Codici Invito";
    }

    public async Task OnAppearingAsync() => await LoadAsync();

    [RelayCommand]
    private async Task RefreshAsync()
    {
        IsRefreshing = true;
        await LoadAsync();
        IsRefreshing = false;
    }

    private async Task LoadAsync()
    {
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var list = await _httpClient.GetFromJsonAsync<InviteDto[]>("api/invites");
            Invites.Clear();
            if (list != null)
                foreach (var i in list) Invites.Add(i);
            HasData      = Invites.Count > 0;
            IsEmptyState = Invites.Count == 0;
        }
        catch (HttpRequestException)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (System.Text.Json.JsonException ex)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(AdminInvitesViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task GenerateAsync()
    {
        try
        {
            IsBusy = true;
            var resp = await _httpClient.PostAsJsonAsync("api/invites", new { });
            if (!resp.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile generare il codice.", "OK");
                return;
            }
            var created = await resp.Content.ReadFromJsonAsync<InviteDto>();
            if (created != null)
            {
                Invites.Insert(0, created);
                HasData = true; IsEmptyState = false;
                await Shell.Current.DisplayAlertAsync(
                    "Codice generato!",
                    $"Codice: {created.Code}\n\nScade il {created.ExpiresAt:dd/MM/yyyy HH:mm}\n\n" +
                    "Condividi questo codice con il dipendente. Dopo averlo inserito nell'app, " +
                    "sarà automaticamente associato alla tua azienda.",
                    "Copia e chiudi");
            }
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta.", "OK"); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task ShowCodeAsync(InviteDto invite)
    {
        await Shell.Current.DisplayAlertAsync(
            "Codice invito",
            $"Codice: {invite.Code}\n\nScade il {invite.ExpiresAt:dd/MM/yyyy HH:mm}",
            "Chiudi");
    }

    [RelayCommand]
    private async Task RevokeAsync(InviteDto invite)
    {
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Revoca codice", $"Vuoi revocare il codice {invite.Code}?", "Sì", "Annulla");
        if (!confirm) return;
        try
        {
            IsBusy = true;
            var r = await _httpClient.DeleteAsync($"api/invites/{invite.Id}");
            if (r.IsSuccessStatusCode)
                Invites.Remove(invite);
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile revocare il codice.", "OK");
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); }
        finally { IsBusy = false; HasData = Invites.Count > 0; IsEmptyState = Invites.Count == 0; }
    }

    public class InviteDto
    {
        [JsonPropertyName("id")]        public int Id { get; set; }
        [JsonPropertyName("code")]      public string Code { get; set; } = string.Empty;
        [JsonPropertyName("expiresAt")] public DateTime ExpiresAt { get; set; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; set; }

        public string ExpiresLabel => $"Scade {ExpiresAt:dd/MM HH:mm}";
    }
}
