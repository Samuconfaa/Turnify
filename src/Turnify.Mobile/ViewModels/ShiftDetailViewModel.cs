using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

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

    // Form fields
    [ObservableProperty] private ShiftEmployeeDto? _selectedEmployee;
    [ObservableProperty] private DateTime _shiftDate = DateTime.Today;
    [ObservableProperty] private TimeSpan _startTime = new(8, 0, 0);
    [ObservableProperty] private TimeSpan _endTime   = new(16, 0, 0);
    [ObservableProperty] private string _label = string.Empty;
    [ObservableProperty] private string _note = string.Empty;

    public ObservableCollection<ShiftEmployeeDto> Employees { get; } = new();

    public bool IsEditMode  => ShiftId > 0;
    public bool IsCreateMode => !IsEditMode;

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
        await LoadDataAsync();
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        if (IsBusy) return;
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
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", ex.Message, "OK");
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
            Label      = shift.Label;
            Note       = shift.Note;
            SelectedEmployee = Employees.FirstOrDefault(e => e.Id == shift.EmployeeId);
        }
        catch { }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (SelectedEmployee == null)
        {
            await Shell.Current.DisplayAlert("Errore", "Seleziona un dipendente.", "OK");
            return;
        }
        if (EndTime <= StartTime)
        {
            await Shell.Current.DisplayAlert("Errore",
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
                response = await _httpClient.PostAsJsonAsync("api/shifts", dto);
            else
                response = await _httpClient.PutAsJsonAsync($"api/shifts/{ShiftId}", dto);

            if (response.IsSuccessStatusCode)
            {
                await Shell.Current.GoToAsync("..");
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                await Shell.Current.DisplayAlert("Conflitto",
                    "Il dipendente ha già un turno in questo orario.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlert("Errore", "Impossibile salvare il turno.", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", ex.Message, "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (!IsEditMode) return;
        bool confirm = await Shell.Current.DisplayAlert(
            "Elimina turno", "Vuoi eliminare questo turno?", "Sì", "Annulla");
        if (!confirm) return;
        try
        {
            IsBusy = true;
            await _httpClient.DeleteAsync($"api/shifts/{ShiftId}");
            await Shell.Current.GoToAsync("..");
        }
        catch { }
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
    }
}
