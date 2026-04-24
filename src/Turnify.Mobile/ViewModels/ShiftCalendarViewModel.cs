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

    public ShiftCalendarViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Turni";
        var today = DateTime.Today;
        int diff  = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
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

            var from    = CurrentWeekStart.Date;
            var to      = CurrentWeekStart.Date.AddDays(7);
            var fromStr = Uri.EscapeDataString(from.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var toStr   = Uri.EscapeDataString(to.ToString("yyyy-MM-ddTHH:mm:ssZ"));

            // Load shifts
            var shiftResult = await _httpClient.GetFromJsonAsync<ShiftListResponse>(
                $"api/shifts?from={fromStr}&to={toStr}&pageSize=200");
            var shiftList = shiftResult?.Data ?? new List<ShiftDto>();
            Shifts = new ObservableCollection<ShiftDto>(shiftList);

            if (IsAdmin)
            {
                // Also load approved vacations for the week
                var vacations = await _httpClient.GetFromJsonAsync<List<ApprovedVacationDto>>(
                    $"api/vacation-requests/approved?from={fromStr}&to={toStr}")
                    ?? new List<ApprovedVacationDto>();

                BuildEmployeeRows(shiftList, vacations);
            }
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

    private void BuildEmployeeRows(
        List<ShiftDto> shifts,
        List<ApprovedVacationDto> vacations)
    {
        // Collect all employee IDs from both shifts and vacations
        var employeeIds = shifts.Select(s => s.EmployeeId)
            .Union(vacations.Select(v => v.EmployeeId))
            .Distinct()
            .ToList();

        var rows = employeeIds.Select(empId =>
        {
            // Name from shifts first, then vacations
            var name = shifts.FirstOrDefault(s => s.EmployeeId == empId)?.EmployeeName
                    ?? vacations.FirstOrDefault(v => v.EmployeeId == empId)?.EmployeeName
                    ?? $"Dipendente {empId}";

            var parts    = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var initials = parts.Length >= 2
                ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
                : name.Length > 0 ? name[0].ToString().ToUpper() : "?";

            var days = Enumerable.Range(0, 7).Select(i =>
            {
                var day   = CurrentWeekStart.AddDays(i);
                var shift = shifts.FirstOrDefault(s =>
                    s.EmployeeId == empId &&
                    s.StartTime.ToLocalTime().Date == day.Date);

                // Check if employee is on approved vacation this day
                var onVacation = vacations.Any(v =>
                    v.EmployeeId == empId &&
                    day.Date >= v.StartDate.Date &&
                    day.Date <= v.EndDate.Date);

                if (onVacation && shift == null)
                    return new DayCell
                    {
                        HasShift    = false,
                        IsVacation  = true,
                        Label       = "🏖️",
                        ShiftId     = 0
                    };

                return new DayCell
                {
                    HasShift   = shift != null,
                    IsVacation = false,
                    Label      = shift != null
                        ? $"{shift.StartTime.ToLocalTime():HH:mm}-{shift.EndTime.ToLocalTime():HH:mm}"
                        : string.Empty,
                    ShiftId    = shift?.Id ?? 0
                };
            }).ToList();

            return new EmployeeWeekRow
            {
                EmployeeId   = empId,
                EmployeeName = name,
                Initials     = initials,
                Days         = days
            };
        }).ToList();

        EmployeeRows = new ObservableCollection<EmployeeWeekRow>(rows);
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
        if (!IsAdmin || cell == null) return;
        if (cell.IsVacation)
        {
            await Shell.Current.DisplayAlertAsync("In ferie", "Il dipendente è in ferie in questo giorno.", "OK");
            return;
        }
        if (cell.HasShift && cell.ShiftId > 0)
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

public class ApprovedVacationDto
{
    [JsonPropertyName("employeeId")]
    public int EmployeeId { get; set; }
    [JsonPropertyName("employeeName")]
    public string EmployeeName { get; set; } = string.Empty;
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }
    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
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
    public bool IsVacation { get; set; }
    public string Label { get; set; } = string.Empty;
    public int ShiftId { get; set; }
    // Color: blue for shift, orange for vacation, grey for empty
    public string CellColor => IsVacation ? "#D97706" : HasShift ? "#2563EB" : "#E5E7EB";
    public string LabelColor => (HasShift || IsVacation) ? "White" : "Transparent";
}
