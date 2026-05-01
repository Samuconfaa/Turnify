using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class ShiftSwapsViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _isRefreshing;
    [ObservableProperty] private bool _isAdmin;

    public ObservableCollection<SwapDto> Swaps { get; } = new();

    public ShiftSwapsViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        IsAdmin = Preferences.Default.Get("user_role_cached", string.Empty) == "Admin";
        Title = "Scambi Turni";
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
            var list = await _httpClient.GetFromJsonAsync<SwapDto[]>("api/shift-swaps");
            Swaps.Clear();
            if (list != null)
                foreach (var s in list) Swaps.Add(s);
            HasData = Swaps.Count > 0;
            IsEmptyState = Swaps.Count == 0;
        }
        catch (HttpRequestException) { HasError = true; ErrorMessage = "Errore di connessione al server."; }
        catch (System.Text.Json.JsonException ex)
        {
            HasError = true; ErrorMessage = "Risposta non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ShiftSwapsViewModel));
        }
        catch (TaskCanceledException) { HasError = true; ErrorMessage = "Richiesta scaduta. Riprova."; }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task AcceptAsync(SwapDto swap)
    {
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Accetta scambio", "Vuoi accettare questa proposta di scambio?", "Sì", "Annulla");
        if (!confirm) return;
        await RespondAsync(swap, "peer-accept");
    }

    [RelayCommand]
    private async Task RejectAsync(SwapDto swap)
    {
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Rifiuta scambio", "Vuoi rifiutare questa proposta?", "Rifiuta", "Annulla");
        if (!confirm) return;
        await RespondAsync(swap, "peer-reject");
    }

    [RelayCommand]
    private async Task AdminApproveAsync(SwapDto swap)
    {
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Approva scambio", "Approvare e applicare questo scambio di turno?", "Approva", "Annulla");
        if (!confirm) return;
        await RespondAsync(swap, "admin-approve");
    }

    [RelayCommand]
    private async Task AdminRejectAsync(SwapDto swap)
    {
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Blocca scambio", "Bloccare questo scambio?", "Blocca", "Annulla");
        if (!confirm) return;
        await RespondAsync(swap, "admin-reject");
    }

    private async Task RespondAsync(SwapDto swap, string action)
    {
        try
        {
            IsBusy = true;
            var r = await _httpClient.PutAsJsonAsync($"api/shift-swaps/{swap.Id}/{action}", new { });
            if (r.IsSuccessStatusCode)
                await LoadAsync();
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Operazione non riuscita.", "OK");
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); }
        finally { IsBusy = false; }
    }

    public class SwapDto
    {
        [JsonPropertyName("id")]                   public int    Id                   { get; set; }
        [JsonPropertyName("requestingEmployeeId")] public int    RequestingEmployeeId { get; set; }
        [JsonPropertyName("requestedEmployeeId")]  public int    RequestedEmployeeId  { get; set; }
        [JsonPropertyName("shiftAId")]             public int    ShiftAId             { get; set; }
        [JsonPropertyName("shiftBId")]             public int    ShiftBId             { get; set; }
        [JsonPropertyName("status")]               public string Status               { get; set; } = string.Empty;
        [JsonPropertyName("note")]                 public string? Note                { get; set; }
        [JsonPropertyName("createdAt")]            public DateTime CreatedAt          { get; set; }

        public string StatusDisplay => Status switch
        {
            "Pending"         => "⏳ In attesa del collega",
            "AcceptedByPeer"  => "✅ Accettato — in attesa admin",
            "RejectedByPeer"  => "❌ Rifiutato dal collega",
            "ApprovedByAdmin" => "✅ Approvato",
            "RejectedByAdmin" => "🚫 Bloccato dall'admin",
            "Executed"        => "🔄 Eseguito",
            _                 => Status
        };

        public bool IsPending         => Status == "Pending";
        public bool IsAcceptedByPeer  => Status == "AcceptedByPeer";
        public bool IsActive          => Status is "Pending" or "AcceptedByPeer";
    }
}
