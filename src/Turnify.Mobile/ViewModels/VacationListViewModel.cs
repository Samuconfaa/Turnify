using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public class VacationRequestDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ReviewNote { get; set; } = string.Empty;
    public DateTime? ReviewedAt { get; set; }
    // Admin only — employee name shown in admin list
    public string EmployeeName { get; set; } = string.Empty;

    public string StatusDisplay => Status switch
    {
        "Pending"   => "In Attesa",
        "Approved"  => "Approvata",
        "Rejected"  => "Rifiutata",
        "Cancelled" => "Annullata",
        _           => Status
    };
    public string TypeDisplay => Type switch
    {
        "Holiday"     => "Ferie",
        "PaidLeave"   => "Permesso pagato",
        "UnpaidLeave" => "Permesso non pagato",
        "SickLeave"   => "Malattia",
        _             => Type
    };
    public string DateRange    => $"{StartDate:dd MMM} – {EndDate:dd MMM yyyy}";
    public string StatusColor  => Status switch
    {
        "Approved"  => "#16A34A",
        "Rejected"  => "#DC2626",
        "Pending"   => "#D97706",
        _           => "#6B7280"
    };
    public string StatusBgColor => Status switch
    {
        "Approved"  => "#E6F4EA",
        "Rejected"  => "#FCE8E6",
        "Pending"   => "#FEF3C7",
        _           => "#F3F4F6"
    };
    public string Initials
    {
        get
        {
            if (string.IsNullOrWhiteSpace(EmployeeName)) return "?";
            var parts = EmployeeName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length >= 2
                ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
                : EmployeeName[0].ToString().ToUpper();
        }
    }
}

public partial class VacationListViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;
    private int _myEmployeeId;

    public ObservableCollection<VacationRequestDto> Requests { get; } = new();

    [ObservableProperty] private bool _isAdmin;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isEmpty;
    [ObservableProperty] private bool _isFormVisible;

    // New request form
    [ObservableProperty] private DateTime _newStartDate = DateTime.Today;
    [ObservableProperty] private DateTime _newEndDate   = DateTime.Today.AddDays(1);
    [ObservableProperty] private string   _newReason    = string.Empty;
    [ObservableProperty] private string   _newType      = "Holiday";

    public string[] VacationTypes        { get; } = { "Holiday", "PaidLeave", "SickLeave", "UnpaidLeave" };
    public string[] VacationTypesDisplay { get; } = { "Ferie", "Permesso Pagato", "Malattia", "Permesso Non Pagato" };

    public VacationListViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Ferie e Permessi";
    }

    public async Task OnAppearingAsync()
    {
        var storedRole = await SecureStorage.Default.GetAsync("user_role");
        IsAdmin = storedRole == "Admin";
        await LoadRequestsAsync();
    }

    [RelayCommand]
    public async Task LoadRequestsAsync()
    {
        if (IsBusy) return;
        HasError = false;
        try
        {
            IsBusy = true;

            // Always fetch /me to get employeeId for submission
            var me = await _httpClient.GetFromJsonAsync<UserMeDto>("api/users/me");
            if (me != null)
                _myEmployeeId = me.EmployeeId;

            var list = await _httpClient.GetFromJsonAsync<VacationRequestDto[]>(
                "api/vacation-requests?pageSize=100");

            Requests.Clear();
            if (list != null)
                foreach (var r in list) Requests.Add(r);

            IsEmpty = Requests.Count == 0;
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

    [RelayCommand]
    private void ShowNewRequestForm()
    {
        NewStartDate  = DateTime.Today;
        NewEndDate    = DateTime.Today.AddDays(1);
        NewReason     = string.Empty;
        NewType       = "Holiday";
        IsFormVisible = true;
    }

    [RelayCommand]
    private void HideForm() => IsFormVisible = false;

    [RelayCommand]
    private async Task SubmitRequestAsync()
    {
        if (NewEndDate < NewStartDate)
        {
            await Shell.Current.DisplayAlert("Errore",
                "La data di fine deve essere dopo la data di inizio.", "OK");
            return;
        }

        // If employeeId is still 0, try to reload it
        if (_myEmployeeId == 0)
        {
            try
            {
                var me = await _httpClient.GetFromJsonAsync<UserMeDto>("api/users/me");
                if (me != null) _myEmployeeId = me.EmployeeId;
            }
            catch { }
        }

        if (_myEmployeeId == 0)
        {
            await Shell.Current.DisplayAlert("Errore",
                "Impossibile identificare il profilo dipendente. Riprova tra poco.", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            int businessDays = CountBusinessDays(NewStartDate, NewEndDate);

            var dto = new
            {
                employeeId = _myEmployeeId,
                type       = NewType,
                startDate  = NewStartDate.Date,
                endDate    = NewEndDate.Date,
                totalDays  = businessDays,
                reason     = NewReason ?? string.Empty
            };

            var response = await _httpClient.PostAsJsonAsync("api/vacation-requests", dto);

            if (response.IsSuccessStatusCode)
            {
                IsFormVisible = false;
                await LoadRequestsAsync();
                await Shell.Current.DisplayAlert("Richiesta inviata",
                    "La tua richiesta è stata inviata all'amministratore.", "OK");
            }
            else
            {
                var body = await response.Content.ReadAsStringAsync();
                await Shell.Current.DisplayAlert("Errore",
                    $"Impossibile inviare la richiesta ({(int)response.StatusCode}).", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", ex.Message, "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task CancelRequestAsync(VacationRequestDto request)
    {
        if (request == null || request.Status != "Pending") return;
        bool confirm = await Shell.Current.DisplayAlert(
            "Annulla richiesta", "Vuoi annullare questa richiesta?", "Sì", "No");
        if (!confirm) return;
        try
        {
            var r = await _httpClient.DeleteAsync($"api/vacation-requests/{request.Id}");
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
            else await Shell.Current.DisplayAlert("Errore", "Impossibile annullare la richiesta.", "OK");
        }
        catch { await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK"); }
    }

    [RelayCommand]
    private async Task ApproveAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        try
        {
            var r = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/approve",
                new { note = string.Empty });
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
        }
        catch { }
    }

    [RelayCommand]
    private async Task RejectAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        var note = await Shell.Current.DisplayPromptAsync(
            "Rifiuta", "Nota (opzionale):", "Rifiuta", "Annulla");
        if (note == null) return;
        try
        {
            var r = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/reject",
                new { note = note ?? string.Empty });
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
        }
        catch { }
    }

    private static int CountBusinessDays(DateTime start, DateTime end)
    {
        int count = 0;
        for (var d = start; d <= end; d = d.AddDays(1))
            if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday)
                count++;
        return count;
    }

    private class UserMeDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("employeeId")]
        public int EmployeeId { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
    }
}
