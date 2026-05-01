using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public class DashboardShiftDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string DisplayTime => $"{StartTime:HH:mm} – {EndTime:HH:mm}  ·  {Role}";
}

public class DashboardPendingVacationDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string DisplayDate => $"{StartDate:dd} – {EndDate:dd MMM}  ·  {TypeDisplay}";
    public string Initials
    {
        get
        {
            if (EmployeeName.Length == 0) return "?";
            var parts = EmployeeName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[parts.Length - 1][0]}".ToUpper();
            return EmployeeName[0].ToString().ToUpper();
        }
    }
    public string TypeDisplay => Type switch
    {
        "Holiday" => "Ferie",
        "PaidLeave" => "Permesso pagato",
        "UnpaidLeave" => "Permesso non pagato",
        "SickLeave" => "Malattia",
        _ => Type
    };
}

public class DashboardSummaryDto
{
    public int TotalEmployees { get; set; }
    public int ShiftsThisWeek { get; set; }
    public int PendingVacations { get; set; }
    public decimal TotalHoursScheduled { get; set; }
    public DashboardShiftDto[] ShiftsToday { get; set; } = Array.Empty<DashboardShiftDto>();
    public DashboardPendingVacationDto[] PendingRequests { get; set; } = Array.Empty<DashboardPendingVacationDto>();
}

public class CoverageDay
{
    [JsonPropertyName("date")]     public DateTime Date     { get; set; }
    [JsonPropertyName("coverage")] public string   Coverage { get; set; } = string.Empty;
    [JsonPropertyName("count")]    public int      Count    { get; set; }

    public string DayLabel   => Date.ToString("ddd");
    public string DateLabel  => Date.ToString("dd/MM");
    public string Icon       => Coverage switch { "Full" => "✅", "Partial" => "⚠️", _ => "❌" };
    public Color  CardColor  => Coverage switch
    {
        "Full"    => Color.FromArgb("#E6F4EA"),
        "Partial" => Color.FromArgb("#FFF8E1"),
        _         => Color.FromArgb("#FDECEA")
    };
    public Color  TextColor  => Coverage switch
    {
        "Full"    => Color.FromArgb("#2E7D32"),
        "Partial" => Color.FromArgb("#F57F17"),
        _         => Color.FromArgb("#C62828")
    };
}

public partial class DashboardViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _totalEmployees;
    [ObservableProperty] private int _shiftsThisWeek;
    [ObservableProperty] private int _pendingVacations;
    [ObservableProperty] private decimal _totalHoursScheduled;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isAdmin;

    public ObservableCollection<DashboardShiftDto> ShiftsToday { get; } = new();
    public ObservableCollection<DashboardPendingVacationDto> PendingRequests { get; } = new();
    public ObservableCollection<CoverageDay> WeeklyCoverage { get; } = new();

    public DashboardViewModel(IHttpClientFactory httpClientFactory)
    {
        Title = "Dashboard";
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        IsAdmin = Preferences.Default.Get("user_role_cached", string.Empty) == "Admin";
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        if (IsBusy) return;

        HasError = false;
        ErrorMessage = string.Empty;

        try
        {
            IsBusy = true;

            var summary = await _httpClient.GetFromJsonAsync<DashboardSummaryDto>("api/dashboard/summary");

            if (summary != null)
            {
                TotalEmployees = summary.TotalEmployees;
                ShiftsThisWeek = summary.ShiftsThisWeek;
                PendingVacations = summary.PendingVacations;
                TotalHoursScheduled = summary.TotalHoursScheduled;

                ShiftsToday.Clear();
                foreach (var s in summary.ShiftsToday)
                    ShiftsToday.Add(s);

                PendingRequests.Clear();
                foreach (var r in summary.PendingRequests)
                    PendingRequests.Add(r);

                bool empty = TotalEmployees == 0 && ShiftsThisWeek == 0;
                HasData = !empty;
                IsEmptyState = empty;

                if (IsAdmin)
                    await LoadCoverageAsync();
            }
            else
            {
                HasData = false;
                IsEmptyState = true;
            }
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Troppi tentativi. Riprova tra qualche minuto.";
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
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(DashboardViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task LoadCoverageAsync()
    {
        try
        {
            var from = DateTime.Today.ToString("yyyy-MM-dd");
            var to   = DateTime.Today.AddDays(6).ToString("yyyy-MM-dd");
            var days = await _httpClient.GetFromJsonAsync<CoverageDay[]>(
                $"api/shifts/coverage?from={from}&to={to}");
            WeeklyCoverage.Clear();
            if (days != null)
                foreach (var d in days) WeeklyCoverage.Add(d);
        }
        catch { /* non critico */ }
    }

    // Fix 6 & 8: Approve vacation from dashboard
    [RelayCommand]
    private async Task ApproveVacationAsync(DashboardPendingVacationDto request)
    {
        if (request == null) return;
        try
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/approve",
                new { note = string.Empty });

            if (response.IsSuccessStatusCode)
            {
                PendingRequests.Remove(request);
                PendingVacations = System.Math.Max(0, PendingVacations - 1);
                await Shell.Current.DisplayAlertAsync("Successo", $"Ferie di {request.EmployeeName} approvate.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile approvare la richiesta.", "OK");
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
    }

    [RelayCommand]
    private async Task RejectVacationAsync(DashboardPendingVacationDto request)
    {
        if (request == null) return;

        var note = await Shell.Current.DisplayPromptAsync(
            "Rifiuta richiesta",
            $"Aggiungi una nota per {request.EmployeeName} (opzionale):",
            "Rifiuta", "Annulla");
        if (note == null) return; // cancelled

        try
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/reject",
                new { note = note ?? string.Empty });

            if (response.IsSuccessStatusCode)
            {
                PendingRequests.Remove(request);
                PendingVacations = System.Math.Max(0, PendingVacations - 1);
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile rifiutare la richiesta.", "OK");
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
    }
}
