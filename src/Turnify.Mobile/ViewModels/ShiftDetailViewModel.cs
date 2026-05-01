using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public class ShiftEmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public int? BusinessId { get; set; }
}

[QueryProperty(nameof(ShiftId), "shiftId")]
public partial class ShiftDetailViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _shiftId;
    [ObservableProperty] private bool _isRecurring;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;

    // Form fields
    [ObservableProperty] private ShiftEmployeeDto? _selectedEmployee;
    [ObservableProperty] private DateTime _shiftDate = DateTime.Today;
    [ObservableProperty] private TimeSpan _startTime = new(8, 0, 0);
    [ObservableProperty] private TimeSpan _endTime   = new(16, 0, 0);
    [ObservableProperty] private string _label = string.Empty;
    [ObservableProperty] private string _note = string.Empty;
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(RepeatLabel))]
    private int _repeatWeeks = 0;

    public string RepeatLabel => RepeatWeeks == 0
        ? "Non ripetere"
        : $"Ripeti per {RepeatWeeks} settiman{(RepeatWeeks == 1 ? "a" : "e")} ({RepeatWeeks} copie)";

    public ObservableCollection<ShiftEmployeeDto> Employees { get; } = new();

    public bool IsEditMode  => ShiftId > 0;
    public bool IsCreateMode => !IsEditMode;
    public bool IsEmployee  => Preferences.Default.Get("user_role_cached", string.Empty) != "Admin";
    public bool CanProposeSwap => IsEditMode && IsEmployee;

    public ShiftDetailViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Nuovo Turno";
    }

    async partial void OnShiftIdChanged(int value)
    {
        Title = IsEditMode ? "Modifica Turno" : "Nuovo Turno";
        OnPropertyChanged(nameof(IsEditMode));
        OnPropertyChanged(nameof(IsCreateMode));
        if (IsEditMode) RepeatWeeks = 0; // non ha senso ripetere in modifica
        await LoadDataAsync();
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

            // Load active employees
            var emps = await _httpClient.GetFromJsonAsync<ShiftEmployeeDto[]>("api/employees");
            Employees.Clear();
            if (emps != null)
                foreach (var e in emps) Employees.Add(e);

            if (Employees.Count > 0 && SelectedEmployee == null)
                SelectedEmployee = Employees[0];

            if (IsEditMode)
                await LoadShiftAsync();

            HasData = Employees.Count > 0;
            IsEmptyState = Employees.Count == 0;
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (JsonException ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ShiftDetailViewModel));
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

    private async Task LoadShiftAsync()
    {
        try
        {
            var shift = await _httpClient.GetFromJsonAsync<ShiftApiDto>($"api/shifts/{ShiftId}");
            if (shift == null) return;
            ShiftDate  = shift.StartTime.Date;
            StartTime  = shift.StartTime.TimeOfDay;
            EndTime    = shift.EndTime.TimeOfDay;
            Label       = shift.Label;
            Note        = shift.Note;
            IsRecurring = shift.IsRecurring;
            SelectedEmployee = Employees.FirstOrDefault(e => e.Id == shift.EmployeeId);
        }
        catch (HttpRequestException) { }
        catch (JsonException) { }
        catch (TaskCanceledException) { }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (SelectedEmployee == null)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Seleziona un dipendente.", "OK");
            return;
        }
        if (EndTime <= StartTime)
        {
            await Shell.Current.DisplayAlertAsync("Errore",
                "L'orario di fine deve essere dopo l'orario di inizio.", "OK");
            return;
        }

        try
        {
            IsBusy = true;

            var startDateTime = ShiftDate.Date + StartTime;
            var endDateTime   = ShiftDate.Date + EndTime;

            // Handle cross-midnight shifts
            if (endDateTime < startDateTime)
                endDateTime = endDateTime.AddDays(1);

            var dto = new
            {
                employeeId = SelectedEmployee.Id,
                startTime  = startDateTime.ToUniversalTime(),
                endTime    = endDateTime.ToUniversalTime(),
                label      = Label,
                note       = Note,
                status     = 0, // Scheduled
                isRecurring = false
            };

            HttpResponseMessage response;
            if (IsCreateMode)
            {
                response = await _httpClient.PostAsJsonAsync("api/shifts", dto);
            }
            else
            {
                var scope = string.Empty;
                if (IsRecurring)
                {
                    var choice = await Shell.Current.DisplayActionSheetAsync(
                        "Turno ricorrente", "Annulla", null,
                        "Solo questo turno", "Questo e tutti i successivi");
                    if (choice == "Annulla" || choice == null) { IsBusy = false; return; }
                    scope = choice == "Solo questo turno" ? "?scope=single" : "?scope=following";
                }
                response = await _httpClient.PutAsJsonAsync($"api/shifts/{ShiftId}{scope}", dto);
            }

            if (response.IsSuccessStatusCode)
            {
                // Crea copie ricorrenti nelle settimane successive
                if (IsCreateMode && RepeatWeeks > 0)
                {
                    for (int w = 1; w <= RepeatWeeks; w++)
                    {
                        try
                        {
                            var recurringDto = new
                            {
                                employeeId  = SelectedEmployee!.Id,
                                startTime   = startDateTime.AddDays(7 * w).ToUniversalTime(),
                                endTime     = endDateTime.AddDays(7 * w).ToUniversalTime(),
                                label       = Label,
                                note        = Note,
                                status      = 0,
                                isRecurring = true
                            };
                            await _httpClient.PostAsJsonAsync("api/shifts", recurringDto);
                        }
                        catch (HttpRequestException) { /* salta in caso di conflitto */ }
                        catch (TaskCanceledException) { /* salta in caso di conflitto */ }
                    }
                }
                await Shell.Current.GoToAsync("..");
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                await Shell.Current.DisplayAlertAsync("Conflitto",
                    "Il dipendente ha già un turno in questo orario.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile salvare il turno.", "OK");
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (JsonException ex)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ShiftDetailViewModel));
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task ProposeSwapAsync()
    {
        await Shell.Current.GoToAsync($"ShiftSwapRequestPage?myShiftId={ShiftId}");
    }

    [RelayCommand]
    private void IncrementRepeatWeeks() { if (RepeatWeeks < 12) RepeatWeeks++; }

    [RelayCommand]
    private void DecrementRepeatWeeks() { if (RepeatWeeks > 0) RepeatWeeks--; }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (!IsEditMode) return;
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Elimina turno", "Vuoi eliminare questo turno?", "Sì", "Annulla");
        if (!confirm) return;
        try
        {
            IsBusy = true;
            await _httpClient.DeleteAsync($"api/shifts/{ShiftId}");
            await Shell.Current.GoToAsync("..");
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
        finally { IsBusy = false; }
    }

    private class ShiftApiDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public bool IsRecurring { get; set; }
    }
}
