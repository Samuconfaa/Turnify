using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class AttendanceEntryDto
{
    [JsonPropertyName("id")]            public int Id { get; set; }
    [JsonPropertyName("checkInTime")]   public DateTime CheckInTime { get; set; }
    [JsonPropertyName("checkOutTime")]  public DateTime? CheckOutTime { get; set; }
    [JsonPropertyName("hoursWorked")]   public double? HoursWorked { get; set; }
    [JsonPropertyName("checkInMethod")] public string CheckInMethod { get; set; } = string.Empty;
    [JsonPropertyName("notes")]         public string Notes { get; set; } = string.Empty;

    public string DayLabel    => CheckInTime.ToLocalTime().ToString("ddd dd MMM", new System.Globalization.CultureInfo("it-IT"));
    public string TimeDisplay => CheckOutTime.HasValue
        ? $"{CheckInTime.ToLocalTime():HH:mm} → {CheckOutTime.Value.ToLocalTime():HH:mm}"
        : $"Entrata {CheckInTime.ToLocalTime():HH:mm} · in corso";
    public string HoursLabel  => HoursWorked.HasValue
        ? $"{HoursWorked.Value:F1} ore"
        : "In corso";
    public bool IsComplete    => CheckOutTime.HasValue;
}

public class MonthlySummaryDto
{
    [JsonPropertyName("year")]       public int Year { get; set; }
    [JsonPropertyName("month")]      public int Month { get; set; }
    [JsonPropertyName("daysWorked")] public int DaysWorked { get; set; }
    [JsonPropertyName("totalHours")] public double TotalHours { get; set; }
}

public partial class AttendanceHistoryViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int     _daysWorked;
    [ObservableProperty] private double  _totalHours;
    [ObservableProperty] private string  _monthLabel = string.Empty;
    [ObservableProperty] private bool    _hasError;
    [ObservableProperty] private string  _errorMessage = string.Empty;

    public ObservableCollection<AttendanceEntryDto> Entries { get; } = new();

    private int _year  = DateTime.Now.Year;
    private int _month = DateTime.Now.Month;

    public AttendanceHistoryViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title       = "Storico presenze";
        UpdateMonthLabel();
    }

    private void UpdateMonthLabel()
    {
        MonthLabel = new DateTime(_year, _month, 1)
            .ToString("MMMM yyyy", new System.Globalization.CultureInfo("it-IT"));
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        if (IsBusy) return;
        HasError     = false;
        ErrorMessage = string.Empty;

        try
        {
            IsBusy = true;

            var summary = await _httpClient.GetFromJsonAsync<MonthlySummaryDto>(
                $"api/attendance/monthly-summary?year={_year}&month={_month}");
            if (summary != null)
            {
                DaysWorked = summary.DaysWorked;
                TotalHours = summary.TotalHours;
            }

            var from = new DateTime(_year, _month, 1).ToString("yyyy-MM-ddTHH:mm:ssZ");
            var to   = new DateTime(_year, _month, 1).AddMonths(1).ToString("yyyy-MM-ddTHH:mm:ssZ");

            var result = await _httpClient.GetFromJsonAsync<AttendanceHistoryResponse>(
                $"api/attendance/history?from={Uri.EscapeDataString(from)}&to={Uri.EscapeDataString(to)}&pageSize=100");

            Entries.Clear();
            if (result?.Data != null)
                foreach (var e in result.Data)
                    Entries.Add(e);
        }
        catch (HttpRequestException)
        {
            HasError     = true;
            ErrorMessage = "Impossibile connettersi al server.";
        }
        catch (Exception ex)
        {
            HasError     = true;
            ErrorMessage = ex.Message;
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(AttendanceHistoryViewModel));
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task PreviousMonthAsync()
    {
        _month--;
        if (_month == 0) { _month = 12; _year--; }
        UpdateMonthLabel();
        await LoadDataAsync();
    }

    [RelayCommand]
    private async Task NextMonthAsync()
    {
        var now = DateTime.Now;
        if (_year == now.Year && _month == now.Month) return;
        _month++;
        if (_month == 13) { _month = 1; _year++; }
        UpdateMonthLabel();
        await LoadDataAsync();
    }
}

public class AttendanceHistoryResponse
{
    [JsonPropertyName("data")]  public System.Collections.Generic.List<AttendanceEntryDto> Data  { get; set; } = new();
    [JsonPropertyName("total")] public int Total { get; set; }
}
