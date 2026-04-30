using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class EmployeeHoursReportDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public double TotalHours { get; set; }
    public ObservableCollection<HoursBreakdownDto> Breakdown { get; set; } = new();
    public bool IsExpanded { get; set; }
    public string TotalHoursDisplay => $"{TotalHours:F1} h";
}

public class HoursBreakdownDto
{
    public string Period { get; set; } = string.Empty;
    public double Hours { get; set; }
    public string HoursDisplay => $"{Hours:F1} h";
}

public partial class EmployeeReportsViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public ObservableCollection<EmployeeHoursReportDto> Reports { get; } = new();

    [ObservableProperty] private DateTime _from = new(DateTime.Today.Year, DateTime.Today.Month, 1);
    [ObservableProperty] private DateTime _to   = DateTime.Today;
    [ObservableProperty] private string _selectedGroupBy = "month";
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isEmptyState;

    public ObservableCollection<string> GroupByOptions { get; } = new() { "month", "week" };

    public EmployeeReportsViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Report ore";
    }

    [RelayCommand]
    public async Task LoadReportsAsync()
    {
        if (IsBusy) return;
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var fromStr = Uri.EscapeDataString(From.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var toStr   = Uri.EscapeDataString(To.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var url     = $"api/reports/employee-hours?from={fromStr}&to={toStr}&groupBy={SelectedGroupBy}";

            var result = await _httpClient.GetFromJsonAsync<EmployeeHoursReportDto[]>(url);
            Reports.Clear();
            if (result != null)
                foreach (var r in result) Reports.Add(r);
            IsEmptyState = Reports.Count == 0;
        }
        catch (HttpRequestException)
        {
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (System.Text.Json.JsonException ex)
        {
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeReportsViewModel));
        }
        catch (TaskCanceledException)
        {
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void ToggleExpand(EmployeeHoursReportDto report)
    {
        if (report == null) return;
        report.IsExpanded = !report.IsExpanded;
        var idx = Reports.IndexOf(report);
        if (idx >= 0)
        {
            Reports.RemoveAt(idx);
            Reports.Insert(idx, report);
        }
    }
}
