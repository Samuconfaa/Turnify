using System;
using System.Collections.ObjectModel;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class ShiftCalendarViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    private bool _isAdmin;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(WeekLabel))]
    private DateTime _currentWeekStart;

    [ObservableProperty]
    private ObservableCollection<ShiftDto> _shifts = new();

    [ObservableProperty]
    private ObservableCollection<EmployeeWeekRow> _employeeRows = new();

    public string WeekLabel
    {
        get
        {
            var end = CurrentWeekStart.AddDays(4);
            return $"{CurrentWeekStart:dd MMM} - {end:dd MMM yyyy}";
        }
    }

    public ShiftCalendarViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Turni";
        // Calcola il lunedì della settimana corrente
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
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            if (string.IsNullOrEmpty(token)) return;

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var role = jwt.Claims.FirstOrDefault(c => c.Type == "role"
                || c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            IsAdmin = role == "Admin";
        }
        catch { IsAdmin = false; }
    }

    [RelayCommand]
    private async Task LoadShiftsAsync()
    {
        IsBusy = true;
        try
        {
            var from = CurrentWeekStart.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var to = CurrentWeekStart.AddDays(5).ToString("yyyy-MM-ddTHH:mm:ssZ");
            var url = $"api/shifts?from={from}&to={to}";

            var result = await _httpClient.GetFromJsonAsync<ShiftListResponse>(url);
            Shifts = new ObservableCollection<ShiftDto>(result?.Data ?? []);

            if (IsAdmin)
                BuildEmployeeRows();
        }
        catch { /* gestione errore silenziosa per ora */ }
        finally { IsBusy = false; }
    }

    private void BuildEmployeeRows()
    {
        var grouped = Shifts
            .GroupBy(s => s.EmployeeId)
            .Select(g => new EmployeeWeekRow
            {
                EmployeeName = g.First().EmployeeName,
                Days = Enumerable.Range(0, 5).Select(i =>
                {
                    var day = CurrentWeekStart.AddDays(i);
                    var shift = g.FirstOrDefault(s => s.StartTime.Date == day.Date);
                    return new DayCell
                    {
                        HasShift = shift != null,
                        Label = shift != null
                            ? $"{shift.StartTime:HH:mm}-{shift.EndTime:HH:mm}"
                            : string.Empty,
                        ShiftId = shift?.Id ?? 0
                    };
                }).ToList()
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
        await Shell.Current.GoToAsync("ShiftDetailPage");
    }
}

// ── DTOs locali ──────────────────────────────────────────────
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
    public List<ShiftDto> Data { get; set; } = [];
}

public class EmployeeWeekRow
{
    public string EmployeeName { get; set; } = string.Empty;
    public List<DayCell> Days { get; set; } = [];
}

public class DayCell
{
    public bool HasShift { get; set; }
    public string Label { get; set; } = string.Empty;
    public int ShiftId { get; set; }
}