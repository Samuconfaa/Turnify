using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

[QueryProperty(nameof(RequestId), "requestId")]
public partial class VacationEditViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _requestId;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private string _employeeName = string.Empty;
    [ObservableProperty] private string _selectedType = "Holiday";
    [ObservableProperty] private int _selectedTypeIndex;
    [ObservableProperty] private DateTime _startDate = DateTime.Today;
    [ObservableProperty] private DateTime _endDate = DateTime.Today.AddDays(1);
    [ObservableProperty] private string _reason = string.Empty;
    [ObservableProperty] private string _selectedStatus = "Pending";
    [ObservableProperty] private int _selectedStatusIndex;
    [ObservableProperty] private string _reviewNote = string.Empty;

    // Saldo ferie
    [ObservableProperty] private string _balanceLabel = string.Empty;
    [ObservableProperty] private bool _showBalanceWarning;
    [ObservableProperty] private bool _showBalance;

    public string[] VacationTypes        { get; } = { "Holiday", "PaidLeave", "SickLeave", "UnpaidLeave" };
    public string[] VacationTypesDisplay { get; } = { "Ferie", "Permesso Pagato", "Malattia", "Permesso Non Pagato" };
    public string[] StatusOptions        { get; } = { "Pending", "Approved", "Rejected", "Cancelled" };
    public string[] StatusOptionsDisplay { get; } = { "In Attesa", "Approvata", "Rifiutata", "Annullata" };

    private VacationBalanceDto? _balance;

    partial void OnSelectedTypeIndexChanged(int value)
    {
        SelectedType = VacationTypes.ElementAtOrDefault(value) ?? "Holiday";
        UpdateBalanceLabel();
    }

    partial void OnSelectedStatusIndexChanged(int value) =>
        SelectedStatus = StatusOptions.ElementAtOrDefault(value) ?? "Pending";

    public VacationEditViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Modifica Richiesta";
    }

    public async Task OnAppearingAsync() => await LoadBalanceAsync();

    private async Task LoadBalanceAsync()
    {
        try
        {
            _balance = await _httpClient.GetFromJsonAsync<VacationBalanceDto>("api/vacation-balance/me");
            UpdateBalanceLabel();
        }
        catch { /* saldo non critico */ }
    }

    private void UpdateBalanceLabel()
    {
        if (_balance == null) { ShowBalance = false; return; }
        ShowBalance = true;
        (int total, int remaining) = SelectedType switch
        {
            "Holiday"   => (_balance.Holiday.Total,   _balance.Holiday.Remaining),
            "PaidLeave" => (_balance.PaidLeave.Total, _balance.PaidLeave.Remaining),
            _           => (0, 0)
        };
        if (total == 0) { ShowBalance = false; return; }

        var emoji = SelectedType == "Holiday" ? "🏖️" : "📋";
        var label = VacationTypesDisplay.ElementAtOrDefault(SelectedTypeIndex) ?? SelectedType;
        BalanceLabel      = $"{emoji} {label} — {remaining} giorni rimanenti su {total}";
        ShowBalanceWarning = remaining == 0;
        ShowBalance        = true;
    }

    async partial void OnRequestIdChanged(int value)
    {
        if (value > 0) await LoadAsync();
    }

    private async Task LoadAsync()
    {
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var list = await _httpClient.GetFromJsonAsync<VacationRequestDto[]>(
                "api/vacation-requests?pageSize=200");
            var item = list?.FirstOrDefault(r => r.Id == RequestId);
            if (item == null)
            {
                HasData = false;
                IsEmptyState = true;
                return;
            }

            EmployeeName   = item.EmployeeName;
            var typeIdx = Array.IndexOf(VacationTypes, item.Type);
            SelectedTypeIndex   = typeIdx >= 0 ? typeIdx : 0;
            StartDate      = item.StartDate;
            EndDate        = item.EndDate;
            Reason         = item.Reason;
            var statusIdx = Array.IndexOf(StatusOptions, item.Status);
            SelectedStatusIndex = statusIdx >= 0 ? statusIdx : 0;
            ReviewNote     = item.ReviewNote ?? string.Empty;
            HasData = true;
            IsEmptyState = false;
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (System.Text.Json.JsonException ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(VacationEditViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (EndDate < StartDate)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "La data di fine deve essere dopo la data di inizio.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var dto = new
            {
                type      = SelectedType,
                startDate = StartDate.Date,
                endDate   = EndDate.Date,
                totalDays = CountBusinessDays(StartDate, EndDate),
                reason    = Reason ?? string.Empty,
                status    = SelectedStatus
            };
            var r = await _httpClient.PutAsJsonAsync($"api/vacation-requests/{RequestId}", dto);
            if (r.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync("Salvato", "Richiesta aggiornata.", "OK");
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile salvare.", "OK");
            }
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (System.Text.Json.JsonException ex) { await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK"); _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(VacationEditViewModel)); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
        finally { IsBusy = false; }
    }

    private static int CountBusinessDays(DateTime start, DateTime end)
    {
        int count = 0;
        for (var d = start; d <= end; d = d.AddDays(1))
            if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday)
                count++;
        return count;
    }

    private class VacationBalanceDto
    {
        [JsonPropertyName("holiday")]   public BalanceEntry Holiday   { get; set; } = new();
        [JsonPropertyName("paidLeave")] public BalanceEntry PaidLeave { get; set; } = new();

        public class BalanceEntry
        {
            [JsonPropertyName("total")]     public int Total     { get; set; }
            [JsonPropertyName("used")]      public int Used      { get; set; }
            [JsonPropertyName("remaining")] public int Remaining { get; set; }
        }
    }

    private class VacationRequestDto
    {
        [JsonPropertyName("id")]           public int Id { get; set; }
        [JsonPropertyName("employeeName")] public string EmployeeName { get; set; } = string.Empty;
        [JsonPropertyName("type")]         public string Type { get; set; } = string.Empty;
        [JsonPropertyName("startDate")]    public DateTime StartDate { get; set; }
        [JsonPropertyName("endDate")]      public DateTime EndDate { get; set; }
        [JsonPropertyName("reason")]       public string Reason { get; set; } = string.Empty;
        [JsonPropertyName("status")]       public string Status { get; set; } = string.Empty;
        [JsonPropertyName("reviewNote")]   public string? ReviewNote { get; set; }
    }
}
