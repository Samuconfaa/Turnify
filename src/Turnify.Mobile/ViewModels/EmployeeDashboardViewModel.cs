using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;

namespace Turnify.Mobile.ViewModels;

public class EmployeeSummaryDto
{
    [JsonPropertyName("nextShift")]                 public NextShiftDto? NextShift { get; set; }
    [JsonPropertyName("vacationDaysUsedThisYear")]  public int VacationDaysUsedThisYear { get; set; }
    [JsonPropertyName("vacationDaysAllowed")]       public int VacationDaysAllowed { get; set; }
    [JsonPropertyName("pendingVacationRequests")]   public int PendingVacationRequests { get; set; }
    [JsonPropertyName("isCheckedInToday")]          public bool IsCheckedInToday { get; set; }
    [JsonPropertyName("todayCheckIn")]              public DateTime? TodayCheckIn { get; set; }
    [JsonPropertyName("todayCheckOut")]             public DateTime? TodayCheckOut { get; set; }
    [JsonPropertyName("hoursWorkedThisMonth")]      public decimal HoursWorkedThisMonth { get; set; }
    [JsonPropertyName("hoursScheduledThisWeek")]    public decimal HoursScheduledThisWeek { get; set; }
}

public class NextShiftDto
{
    [JsonPropertyName("id")]        public int Id { get; set; }
    [JsonPropertyName("startTime")] public DateTime StartTime { get; set; }
    [JsonPropertyName("endTime")]   public DateTime EndTime { get; set; }
    [JsonPropertyName("label")]     public string Label { get; set; } = string.Empty;
    [JsonPropertyName("note")]      public string Note { get; set; } = string.Empty;

    public string DisplayDay   => StartTime.ToLocalTime().ToString("dddd dd MMM", new System.Globalization.CultureInfo("it-IT"));
    public string DisplayTime  => $"{StartTime.ToLocalTime():HH:mm} – {EndTime.ToLocalTime():HH:mm}";
    public string DisplayLabel => string.IsNullOrEmpty(Label) ? "Turno di lavoro" : Label;
    public bool IsToday        => StartTime.ToLocalTime().Date == DateTime.Today;
    public bool IsTomorrow     => StartTime.ToLocalTime().Date == DateTime.Today.AddDays(1);
    public string WhenText     => IsToday ? "Oggi" : IsTomorrow ? "Domani" : DisplayDay;
}

public partial class EmployeeDashboardViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private NextShiftDto? _nextShift;
    [ObservableProperty] private int     _vacationDaysUsed;
    [ObservableProperty] private int     _vacationDaysAllowed;
    [ObservableProperty] private int     _vacationDaysRemaining;
    [ObservableProperty] private int     _pendingVacations;
    [ObservableProperty] private bool    _isCheckedInToday;
    [ObservableProperty] private string  _checkInDisplay  = string.Empty;
    [ObservableProperty] private string  _checkOutDisplay = string.Empty;
    [ObservableProperty] private decimal _hoursThisMonth;
    [ObservableProperty] private decimal _hoursThisWeek;
    [ObservableProperty] private bool    _hasError;
    [ObservableProperty] private string  _errorMessage = string.Empty;

    public bool HasNextShift    => NextShift != null;
    public bool NoNextShift     => NextShift == null;

    public EmployeeDashboardViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title       = "La mia dashboard";
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
            var summary = await _httpClient
                .GetFromJsonAsync<EmployeeSummaryDto>("api/dashboard/employee-summary");

            if (summary == null) return;

            NextShift             = summary.NextShift;
            VacationDaysUsed      = summary.VacationDaysUsedThisYear;
            VacationDaysAllowed   = summary.VacationDaysAllowed > 0 ? summary.VacationDaysAllowed : 25;
            VacationDaysRemaining = System.Math.Max(0, VacationDaysAllowed - VacationDaysUsed);
            PendingVacations      = summary.PendingVacationRequests;
            IsCheckedInToday  = summary.IsCheckedInToday;
            HoursThisMonth    = summary.HoursWorkedThisMonth;
            HoursThisWeek     = summary.HoursScheduledThisWeek;

            CheckInDisplay    = summary.TodayCheckIn.HasValue
                ? summary.TodayCheckIn.Value.ToLocalTime().ToString("HH:mm") : string.Empty;
            CheckOutDisplay   = summary.TodayCheckOut.HasValue
                ? summary.TodayCheckOut.Value.ToLocalTime().ToString("HH:mm") : string.Empty;

            OnPropertyChanged(nameof(HasNextShift));
            OnPropertyChanged(nameof(NoNextShift));
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
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeDashboardViewModel));
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task GoToShiftsAsync()
        => await Shell.Current.GoToAsync("//Shifts");

    [RelayCommand]
    private async Task GoToVacationsAsync()
        => await Shell.Current.GoToAsync("//Vacations");

    [RelayCommand]
    private async Task GoToHistoryAsync()
        => await Shell.Current.GoToAsync(nameof(Views.AttendanceHistoryPage));
}
