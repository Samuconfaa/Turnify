using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
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
    [NotifyPropertyChangedFor(nameof(WeekLabel))]
    private DateTime _currentWeekStart;

    [ObservableProperty]
    private bool _isAdmin;

    [ObservableProperty]
    private ObservableCollection<ShiftDto> _shifts = new();

    [ObservableProperty]
    private ObservableCollection<EmployeeWeekRow> _employeeRows = new();

    [ObservableProperty]
    private bool _hasError;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    public string WeekLabel
    {
        get
        {
            var end = CurrentWeekStart.AddDays(4);
            return $"{CurrentWeekStart:dd MMM} – {end:dd MMM yyyy}";
        }
    }

    public ShiftCalendarViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Turni";

        // Lunedì della settimana corrente
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
        catch
        {
            IsAdmin = false;
        }
    }

    [RelayCommand]
    public async Task LoadShiftsAsync()
    {
        if (IsBusy) return;
        HasError = false;

        try
        {
            IsBusy = true;

            var from = CurrentWeekStart.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var to = CurrentWeekStart.AddDays(5).ToString("yyyy-MM-ddTHH:mm:ssZ");

            string url;
            if (IsAdmin)
            {
                url = $"api/shifts?from={from}&to={to}&pageSize=200";
            }
            else
            {
                // Employee sees only own shifts; server filters by token identity
                url = $"api/shifts?from={from}&to={to}&pageSize=200";
            }

            var result = await _httpClient.GetFromJsonAsync<ShiftListResponse>(url);
            var list = result?.Data ?? new System.Collections.Generic.List<ShiftDto>();

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
        finally
        {
            IsBusy = false;
        }
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
                            ? $"{shift.StartTime:HH:mm}\n{shift.EndTime:HH:mm}"
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

    // Fix 6: Only admin can add shifts — this command is only bound in admin view
    [RelayCommand]
    private async Task AddShiftAsync()
    {
        if (!IsAdmin) return;
        await Shell.Current.GoToAsync("ShiftDetailPage");
    }
}

// ── Local DTOs ──────────────────────────────────────────────
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
    public System.Collections.Generic.List<ShiftDto> Data { get; set; } = new();
}

public class EmployeeWeekRow
{
    public string EmployeeName { get; set; } = string.Empty;
    public System.Collections.Generic.List<DayCell> Days { get; set; } = new();
}

public class DayCell
{
    public bool HasShift { get; set; }
    public string Label { get; set; } = string.Empty;
    public int ShiftId { get; set; }
}
