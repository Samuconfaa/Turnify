using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class ShiftCalendarViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(WeekLabel))]
    [NotifyPropertyChangedFor(nameof(DayHeaders))]
    private DateTime _currentWeekStart;

    [ObservableProperty] private bool _isAdmin;
    [ObservableProperty] private ObservableCollection<ShiftDto> _shifts = new();
    [ObservableProperty] private ObservableCollection<EmployeeWeekRow> _employeeRows = new();
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;

    public string WeekLabel
    {
        get
        {
            var end = CurrentWeekStart.AddDays(6);
            return $"{CurrentWeekStart:dd MMM} – {end:dd MMM yyyy}";
        }
    }

    // 7 day headers with date number for display
    public List<string> DayHeaders => Enumerable.Range(0, 7)
        .Select(i => CurrentWeekStart.AddDays(i).ToString("ddd\ndd"))
        .ToList();

    public ShiftCalendarViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Turni";
        var today = DateTime.Today;
        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        CurrentWeekStart = today.AddDays(-diff);
    }

    public async Task OnAppearingAsync()
    {
        await LoadRoleAsync();
        await LoadShiftsAsync();
    }

    private async Task LoadRoleAsync()
    {
        try
        {
            var stored = await SecureStorage.Default.GetAsync("user_role");
            IsAdmin = stored == "Admin";
        }
        catch { IsAdmin = false; }
    }

    [RelayCommand]
    public async Task LoadShiftsAsync()
    {
        if (IsBusy) return;
        HasError = false;
        try
        {
            IsBusy = true;

            // Full 7-day week: Monday to Sunday
            var from = CurrentWeekStart.Date;
            var to   = CurrentWeekStart.Date.AddDays(7); // exclusive

            var fromStr = Uri.EscapeDataString(from.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var toStr   = Uri.EscapeDataString(to.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var url     = $"api/shifts?from={fromStr}&to={toStr}&pageSize=200";

            // The API returns { data: [...], total: N }
            var result = await _httpClient.GetFromJsonAsync<ShiftListResponse>(url);
            var list   = result?.Data ?? new List<ShiftDto>();

            Shifts = new ObservableCollection<ShiftDto>(list);

            if (IsAdmin)
                BuildEmployeeRows();
        }
        catch (HttpRequestException)
        {
            HasError = true;
            ErrorMessage = "Impossibile connettersi al server.";
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = ex.Message;
        }
        finally { IsBusy = false; }
    }

    private void BuildEmployeeRows()
    {
        var grouped = Shifts
            .GroupBy(s => s.EmployeeId)
            .Select(g =>
            {
                var name = g.First().EmployeeName;
                if (string.IsNullOrWhiteSpace(name))
                    name = $"Dipendente {g.Key}";

                // Build initials for avatar
                var parts    = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var initials = parts.Length >= 2
                    ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
                    : name.Length > 0 ? name[0].ToString().ToUpper() : "?";

                // 7 days (Mon–Sun)
                var days = Enumerable.Range(0, 7).Select(i =>
                {
                    var day   = CurrentWeekStart.AddDays(i);
                    var shift = g.FirstOrDefault(s => s.StartTime.ToLocalTime().Date == day.Date);
                    return new DayCell
                    {
                        HasShift = shift != null,
                        Label    = shift != null
                            ? $"{shift.StartTime.ToLocalTime():HH:mm}-{shift.EndTime.ToLocalTime():HH:mm}"
                            : string.Empty,
                        ShiftId  = shift?.Id ?? 0
                    };
                }).ToList();

                return new EmployeeWeekRow
                {
                    EmployeeId   = g.Key,
                    EmployeeName = name,
                    Initials     = initials,
                    Days         = days
                };
            }).ToList();

        EmployeeRows = new ObservableCollection<EmployeeWeekRow>(grouped);
    }

    [RelayCommand]
    private async Task PreviousWeekAsync()
    {
        CurrentWeekStart = CurrentWeekStart.AddDays(-7);
        await LoadShiftsAsync();
    }

    [RelayCommand]
    private async Task NextWeekAsync()
    {
        CurrentWeekStart = CurrentWeekStart.AddDays(7);
        await LoadShiftsAsync();
    }

    [RelayCommand]
    private async Task AddShiftAsync()
    {
        if (!IsAdmin) return;
        await Shell.Current.GoToAsync(nameof(Views.ShiftDetailPage));
    }

    [RelayCommand]
    private async Task TapShiftAsync(DayCell cell)
    {
        if (!IsAdmin || cell == null || !cell.HasShift) return;
        await Shell.Current.GoToAsync($"{nameof(Views.ShiftDetailPage)}?shiftId={cell.ShiftId}");
    }
}

// ── DTOs ────────────────────────────────────────────────────────────
public class ShiftDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class ShiftListResponse
{
    [JsonPropertyName("data")]
    public List<ShiftDto> Data { get; set; } = new();
    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class EmployeeWeekRow
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public List<DayCell> Days { get; set; } = new();
}

public class DayCell
{
    public bool HasShift { get; set; }
    public string Label { get; set; } = string.Empty;
    public int ShiftId { get; set; }
}
