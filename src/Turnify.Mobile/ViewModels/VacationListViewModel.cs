using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public class VacationRequestDto
{
    [JsonPropertyName("id")]         public int Id { get; set; }
    [JsonPropertyName("employeeId")] public int EmployeeId { get; set; }
    [JsonPropertyName("employeeName")] public string EmployeeName { get; set; } = string.Empty;
    [JsonPropertyName("type")]       public string Type { get; set; } = string.Empty;
    [JsonPropertyName("startDate")]  public DateTime StartDate { get; set; }
    [JsonPropertyName("endDate")]    public DateTime EndDate { get; set; }
    [JsonPropertyName("totalDays")]  public int TotalDays { get; set; }
    [JsonPropertyName("reason")]     public string Reason { get; set; } = string.Empty;
    [JsonPropertyName("status")]     public string Status { get; set; } = string.Empty;
    [JsonPropertyName("reviewNote")] public string ReviewNote { get; set; } = string.Empty;
    [JsonPropertyName("reviewedAt")] public DateTime? ReviewedAt { get; set; }

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
        "Approved" => "#16A34A", "Rejected" => "#DC2626",
        "Pending"  => "#D97706", _ => "#6B7280"
    };
    public string StatusBgColor => Status switch
    {
        "Approved" => "#E6F4EA", "Rejected" => "#FCE8E6",
        "Pending"  => "#FEF3C7", _ => "#F3F4F6"
    };
    public bool IsPending  => Status == "Pending";
    public bool IsApproved => Status == "Approved";
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
    [ObservableProperty] private string _filterStatus = "All";

    // Form fields
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(NewDaysPreview))]
    private DateTime _newStartDate = DateTime.Today;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(NewDaysPreview))]
    private DateTime _newEndDate = DateTime.Today.AddDays(1);
    [ObservableProperty] private string   _newReason    = string.Empty;
    [ObservableProperty] private string   _newType      = "Holiday";
    [ObservableProperty] private int      _newTypeIndex;
    [ObservableProperty] private int      _filterIndex;

    public string NewDaysPreview
    {
        get
        {
            if (NewEndDate < NewStartDate) return "⚠️ La data fine è precedente all'inizio";
            var days = CountBusinessDays(NewStartDate, NewEndDate);
            return days == 1 ? "1 giorno lavorativo" : $"{days} giorni lavorativi";
        }
    }

    public string[] VacationTypes        { get; } = { "Holiday", "PaidLeave", "SickLeave", "UnpaidLeave" };
    public string[] VacationTypesDisplay { get; } = { "Ferie", "Permesso Pagato", "Malattia", "Permesso Non Pagato" };
    public string[] FilterOptions        { get; } = { "Tutte", "In Attesa", "Approvate", "Rifiutate" };
    public string[] FilterValues         { get; } = { "All", "Pending", "Approved", "Rejected" };

    partial void OnNewTypeIndexChanged(int value) =>
        NewType = VacationTypes.ElementAtOrDefault(value) ?? "Holiday";

    partial void OnFilterIndexChanged(int value)
    {
        SetFilterByIndex(value);
        LoadRequestsCommand.Execute(null);
    }

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

            var me = await _httpClient.GetFromJsonAsync<UserMeDto>("api/users/me");
            if (me != null) _myEmployeeId = me.EmployeeId;

            var url = "api/vacation-requests?pageSize=200";
            if (FilterStatus != "All") url += $"&status={FilterStatus}";

            var list = await _httpClient.GetFromJsonAsync<VacationRequestDto[]>(url);
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
        NewTypeIndex  = 0;
        IsFormVisible = true;
    }

    [RelayCommand]
    private void HideForm() => IsFormVisible = false;

    [RelayCommand]
    private async Task SubmitRequestAsync()
    {
        if (NewEndDate < NewStartDate)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "La data di fine deve essere dopo la data di inizio.", "OK");
            return;
        }
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
            await Shell.Current.DisplayAlertAsync("Errore", "Impossibile identificare il profilo dipendente. Riprova.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var dto = new
            {
                employeeId = _myEmployeeId,
                type       = NewType,
                startDate  = NewStartDate.Date,
                endDate    = NewEndDate.Date,
                totalDays  = CountBusinessDays(NewStartDate, NewEndDate),
                reason     = NewReason ?? string.Empty
            };
            var response = await _httpClient.PostAsJsonAsync("api/vacation-requests", dto);
            if (response.IsSuccessStatusCode)
            {
                IsFormVisible = false;
                await LoadRequestsAsync();
                await Shell.Current.DisplayAlertAsync("Inviata", "Richiesta inviata all'amministratore.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", $"Errore {(int)response.StatusCode}.", "OK");
            }
        }
        catch (Exception ex) { await Shell.Current.DisplayAlertAsync("Errore", ex.Message, "OK"); }
        finally { IsBusy = false; }
    }

    // Admin: edit request (change dates, status)
    [RelayCommand]
    private async Task EditRequestAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        await Shell.Current.GoToAsync($"{nameof(Views.VacationEditPage)}?requestId={request.Id}");
    }

    // Admin: delete any request
    [RelayCommand]
    private async Task DeleteRequestAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        bool confirm = await Shell.Current.DisplayAlertAsync(
            "Elimina richiesta",
            $"Vuoi eliminare la richiesta di {request.EmployeeName}?",
            "Sì, elimina", "Annulla");
        if (!confirm) return;
        try
        {
            var r = await _httpClient.DeleteAsync($"api/vacation-requests/{request.Id}");
            if (r.IsSuccessStatusCode)
                await LoadRequestsAsync();
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile eliminare la richiesta.", "OK");
        }
        catch { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); }
    }

    [RelayCommand]
    private async Task ApproveAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        try
        {
            var r = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/approve", new { note = string.Empty });
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
        }
        catch { }
    }

    [RelayCommand]
    private async Task RejectAsync(VacationRequestDto request)
    {
        if (!IsAdmin || request == null) return;
        var note = await Shell.Current.DisplayPromptAsync("Rifiuta", "Nota (opzionale):", "Rifiuta", "Annulla");
        if (note == null) return;
        try
        {
            var r = await _httpClient.PutAsJsonAsync(
                $"api/vacation-requests/{request.Id}/reject", new { note = note ?? string.Empty });
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
        }
        catch { }
    }

    // Employee: cancel pending
    [RelayCommand]
    private async Task CancelRequestAsync(VacationRequestDto request)
    {
        if (request == null || request.Status != "Pending") return;
        bool confirm = await Shell.Current.DisplayAlertAsync("Annulla richiesta", "Vuoi annullare?", "Sì", "No");
        if (!confirm) return;
        try
        {
            var r = await _httpClient.DeleteAsync($"api/vacation-requests/{request.Id}");
            if (r.IsSuccessStatusCode) await LoadRequestsAsync();
        }
        catch { }
    }

    public void SetFilterByIndex(int index)
    {
        if (index >= 0 && index < FilterValues.Length)
            FilterStatus = FilterValues[index];
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
        [JsonPropertyName("id")]         public int Id { get; set; }
        [JsonPropertyName("employeeId")] public int EmployeeId { get; set; }
    }
}
