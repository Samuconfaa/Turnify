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

public enum CalendarViewMode
{
    Employee,
    Day
}

public partial class ShiftCalendarViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(WeekLabel))]
    [NotifyPropertyChangedFor(nameof(IsCurrentWeek))]
    [NotifyPropertyChangedFor(nameof(TodayColumnIndex))]
    private DateTime _currentWeekStart;

    [ObservableProperty] private bool _isAdmin;
    [ObservableProperty] private ObservableCollection<ShiftDto> _shifts = new();
    [ObservableProperty] private ObservableCollection<EmployeeWeekRow> _employeeRows = new();

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsEmployeeMode))]
    [NotifyPropertyChangedFor(nameof(IsDayMode))]
    private CalendarViewMode _selectedViewMode = CalendarViewMode.Employee;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(DayLabel))]
    private DateTime _selectedDate = DateTime.Today;

    [ObservableProperty] private ObservableCollection<TimeSlot> _daySlots  = new();

    public bool IsEmployeeMode => SelectedViewMode == CalendarViewMode.Employee;
    public bool IsDayMode      => SelectedViewMode == CalendarViewMode.Day;

    public string DayLabel => SelectedDate.ToString("dddd dd MMMM");
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;

    // Feature 7 – timbratura (employee only)
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(AttendanceStatusText))]
    [NotifyPropertyChangedFor(nameof(CanCheckIn))]
    [NotifyPropertyChangedFor(nameof(CanCheckOut))]
    private bool _hasCheckedIn;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(AttendanceStatusText))]
    [NotifyPropertyChangedFor(nameof(CanCheckOut))]
    private bool _hasCheckedOut;

    [ObservableProperty] private string _checkInTimeDisplay  = string.Empty;
    [ObservableProperty] private string _checkOutTimeDisplay = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasCheckInFeedback))]
    private string _checkInFeedback = string.Empty;
    public bool HasCheckInFeedback => !string.IsNullOrEmpty(CheckInFeedback);

    public bool CanCheckIn  => !HasCheckedIn && !HasCheckedOut;
    public bool CanCheckOut => HasCheckedIn && !HasCheckedOut;
    public bool ShowAttendance => !IsAdmin;

    public string AttendanceStatusText
    {
        get
        {
            if (!HasCheckedIn) return "Non hai ancora timbrato oggi";
            if (!HasCheckedOut) return $"Entrato alle {CheckInTimeDisplay}";
            return $"Entrato {CheckInTimeDisplay} → Uscito {CheckOutTimeDisplay}";
        }
    }

    public string WeekLabel
    {
        get
        {
            var end = CurrentWeekStart.AddDays(6);
            return $"{CurrentWeekStart:dd MMM} – {end:dd MMM yyyy}";
        }
    }

    public bool IsCurrentWeek
    {
        get
        {
            var today = DateTime.Today;
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            return CurrentWeekStart == today.AddDays(-diff);
        }
    }

    public int TodayColumnIndex
    {
        get
        {
            if (!IsCurrentWeek) return -1;
            return (7 + (DateTime.Today.DayOfWeek - DayOfWeek.Monday)) % 7;
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
        if (!IsAdmin)
            await LoadAttendanceAsync();
    }

    private async Task LoadRoleAsync()
    {
        try
        {
            var stored = await SecureStorage.Default.GetAsync("user_role");
            IsAdmin = stored == "Admin";
            OnPropertyChanged(nameof(ShowAttendance));
        }
        catch (Exception) { IsAdmin = false; }
    }

    // Feature 7 – carica stato timbratura odierna
    private async Task LoadAttendanceAsync()
    {
        try
        {
            var dto = await _httpClient.GetFromJsonAsync<AttendanceTodayDto>("api/attendance/today");
            if (dto == null) { HasCheckedIn = false; HasCheckedOut = false; return; }
            HasCheckedIn  = dto.IsCheckedIn || dto.CheckOutTime.HasValue;
            HasCheckedOut = dto.CheckOutTime.HasValue;
            CheckInTimeDisplay  = dto.CheckInTime.HasValue
                ? dto.CheckInTime.Value.ToLocalTime().ToString("HH:mm") : string.Empty;
            CheckOutTimeDisplay = dto.CheckOutTime.HasValue
                ? dto.CheckOutTime.Value.ToLocalTime().ToString("HH:mm") : string.Empty;
        }
        catch (HttpRequestException) { /* non critico */ }
        catch (System.Text.Json.JsonException) { /* non critico */ }
        catch (TaskCanceledException) { /* non critico */ }
    }

    [RelayCommand]
    private async Task CheckInAsync()
    {
        try
        {
            var todayShift = Shifts.FirstOrDefault(s => s.StartTime.ToLocalTime().Date == DateTime.Today);
            var body = new { shiftId = (int?)todayShift?.Id };
            var response = await _httpClient.PostAsJsonAsync("api/attendance/checkin", body);
            if (response.IsSuccessStatusCode)
            {
                await LoadAttendanceAsync();
                CheckInFeedback = "Entrata registrata ✓";
                await Task.Delay(3000);
                CheckInFeedback = string.Empty;
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                await Shell.Current.DisplayAlertAsync("Info", "Sei già entrato oggi.", "OK");
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
    }

    [RelayCommand]
    private async Task CheckOutAsync()
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/attendance/checkout", new { });
            if (response.IsSuccessStatusCode)
            {
                await LoadAttendanceAsync();
                CheckInFeedback = "Uscita registrata ✓";
                await Task.Delay(3000);
                CheckInFeedback = string.Empty;
            }
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
    }

    [RelayCommand]
    public async Task LoadShiftsAsync()
    {
        if (IsBusy) return;
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;

            var from    = CurrentWeekStart.Date;
            var to      = CurrentWeekStart.Date.AddDays(7);
            var fromStr = Uri.EscapeDataString(from.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            var toStr   = Uri.EscapeDataString(to.ToString("yyyy-MM-ddTHH:mm:ssZ"));

            var shiftResult = await _httpClient.GetFromJsonAsync<ShiftListResponse>(
                $"api/shifts?from={fromStr}&to={toStr}&pageSize=200");
            var shiftList = shiftResult?.Data ?? new List<ShiftDto>();
            Shifts = new ObservableCollection<ShiftDto>(shiftList);

            if (IsAdmin)
            {
                var vacations = await _httpClient.GetFromJsonAsync<List<ApprovedVacationDto>>(
                    $"api/vacation-requests/approved?from={fromStr}&to={toStr}")
                    ?? new List<ApprovedVacationDto>();
                BuildEmployeeRows(shiftList, vacations);
                BuildDaySlots(shiftList);
            }

            HasData      = shiftList.Count > 0;
            IsEmptyState = shiftList.Count == 0;
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
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ShiftCalendarViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        catch (Exception ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore imprevisto. Riprova.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ShiftCalendarViewModel));
        }
        finally { IsBusy = false; }
    }

    private void BuildEmployeeRows(
        List<ShiftDto> shifts,
        List<ApprovedVacationDto> vacations)
    {
        var employeeIds = shifts.Select(s => s.EmployeeId)
            .Union(vacations.Select(v => v.EmployeeId))
            .Distinct()
            .ToList();

        var rows = employeeIds.Select(empId =>
        {
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

                var onVacation = vacations.Any(v =>
                    v.EmployeeId == empId &&
                    day.Date >= v.StartDate.Date &&
                    day.Date <= v.EndDate.Date);

                if (onVacation && shift == null)
                    return new DayCell { HasShift = false, IsVacation = true, Label = "🏖️", ShiftId = 0 };

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
    private async Task ChangeViewModeAsync(CalendarViewMode mode)
    {
        SelectedViewMode = mode;
        await LoadShiftsAsync();
    }

    private void BuildDaySlots(List<ShiftDto> shifts)
    {
        var slots = new ObservableCollection<TimeSlot>();
        var dayShifts = shifts.Where(s => s.StartTime.ToLocalTime().Date == SelectedDate.Date).ToList();
        for (int h = 0; h < 24; h++)
        {
            var assigned = dayShifts.Where(s =>
                s.StartTime.ToLocalTime().Hour <= h &&
                s.EndTime.ToLocalTime().Hour > h)
                .Select(s => s.EmployeeName)
                .Distinct().ToList();
            slots.Add(new TimeSlot
            {
                Time      = $"{h:D2}:00",
                Employees = assigned,
                IsClosed  = assigned.Count == 0
            });
        }
        DaySlots = slots;
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

    // Feature 1 – torna alla settimana corrente
    [RelayCommand]
    private async Task GoToTodayAsync()
    {
        var today = DateTime.Today;
        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        var weekStart = today.AddDays(-diff);
        if (CurrentWeekStart == weekStart) return;
        CurrentWeekStart = weekStart;
        await LoadShiftsAsync();
    }

    [RelayCommand]
    private async Task AddShiftAsync()
    {
        if (!IsAdmin) return;
        await Shell.Current.GoToAsync(nameof(Views.ShiftDetailPage));
    }

    // Feature 5 – copia turni della settimana precedente
    [RelayCommand]
    private async Task CopyPreviousWeekAsync()
    {
        if (!IsAdmin) return;

        var prevStart   = CurrentWeekStart.AddDays(-7);
        var prevEnd     = CurrentWeekStart;
        var fromStr     = Uri.EscapeDataString(prevStart.ToString("yyyy-MM-ddTHH:mm:ssZ"));
        var toStr       = Uri.EscapeDataString(prevEnd.ToString("yyyy-MM-ddTHH:mm:ssZ"));

        ShiftListResponse? result;
        try
        {
            result = await _httpClient.GetFromJsonAsync<ShiftListResponse>(
                $"api/shifts?from={fromStr}&to={toStr}&pageSize=200");
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
            return;
        }
        catch (System.Text.Json.JsonException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
            return;
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
            return;
        }

        var prevShifts = result?.Data ?? new List<ShiftDto>();
        if (prevShifts.Count == 0)
        {
            await Shell.Current.DisplayAlertAsync("Info", "Nessun turno nella settimana precedente da copiare.", "OK");
            return;
        }

        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Duplica settimana",
            $"Copiare {prevShifts.Count} turni dalla settimana precedente in questa settimana?",
            "Sì, copia", "Annulla");
        if (!confirm) return;

        IsBusy = true;
        int copied = 0, skipped = 0;
        foreach (var shift in prevShifts)
        {
            try
            {
                var dto = new
                {
                    employeeId  = shift.EmployeeId,
                    startTime   = shift.StartTime.ToLocalTime().AddDays(7).ToUniversalTime(),
                    endTime     = shift.EndTime.ToLocalTime().AddDays(7).ToUniversalTime(),
                    label       = shift.Label,
                    note        = string.Empty,
                    status      = 0,
                    isRecurring = false
                };
                var resp = await _httpClient.PostAsJsonAsync("api/shifts", dto);
                if (resp.IsSuccessStatusCode) copied++; else skipped++;
            }
            catch (HttpRequestException) { skipped++; }
            catch (TaskCanceledException) { skipped++; }
        }
        IsBusy = false;

        await Shell.Current.DisplayAlertAsync(
            "Completato",
            skipped == 0
                ? $"Copiati {copied} turni."
                : $"Copiati {copied} turni. {skipped} saltati (conflitti).",
            "OK");

        await LoadShiftsAsync();
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

// ── DTOs ─────────────────────────────────────────────────────────────
public class ShiftDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public bool IsToday => StartTime.ToLocalTime().Date == DateTime.Today;
    public string AccentColor => IsToday ? "#16A34A" : "#2563EB";
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
    [JsonPropertyName("employeeId")]   public int EmployeeId { get; set; }
    [JsonPropertyName("employeeName")] public string EmployeeName { get; set; } = string.Empty;
    [JsonPropertyName("startDate")]    public DateTime StartDate { get; set; }
    [JsonPropertyName("endDate")]      public DateTime EndDate { get; set; }
    [JsonPropertyName("type")]         public string Type { get; set; } = string.Empty;
}

public class AttendanceTodayDto
{
    [JsonPropertyName("isCheckedIn")]  public bool IsCheckedIn { get; set; }
    [JsonPropertyName("checkInTime")]  public DateTime? CheckInTime { get; set; }
    [JsonPropertyName("checkOutTime")] public DateTime? CheckOutTime { get; set; }
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
    public string CellColor  => IsVacation ? "#D97706" : HasShift ? "#2563EB" : "#E5E7EB";
    public string LabelColor => (HasShift || IsVacation) ? "White" : "Transparent";
}

public class TimeSlot
{
    public string Time { get; set; } = string.Empty;
    public List<string> Employees { get; set; } = new();
    public bool IsClosed { get; set; }
    public string EmployeesDisplay => IsClosed ? "—" : string.Join(", ", Employees);
    public string RowColor => IsClosed ? "#F5F3EE" : "#EEF1FE";
    public string TimeColor => IsClosed ? "#9BA3B5" : "#0F1629";
}
