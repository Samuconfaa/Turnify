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
using Turnify.Mobile.Models;

namespace Turnify.Mobile.ViewModels;

public partial class VacationListViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;
    private int _myEmployeeId;
    private int _currentPage = 1;
    private bool _hasMore;

    public ObservableCollection<VacationRequestDto> Requests { get; } = new();

    [ObservableProperty] private bool _isAdmin;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isFormVisible;
    [ObservableProperty] private string _filterStatus = "All";
    [ObservableProperty] private bool _isLoadingMore;

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
    public string[] VacationTypesDisplay { get; } = { "Ferie", "Permesso retribuito", "Malattia", "Permesso non retribuito" };
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
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;

            var ciOpts = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var me = await _httpClient.GetFromJsonAsync<UserMeDto>("api/users/me", ciOpts);
            if (me != null) _myEmployeeId = me.EmployeeId;

            _currentPage = 1;
            var url = "api/vacation-requests?page=1&pageSize=20";
            if (FilterStatus != "All") url += $"&status={FilterStatus}";

            var result = await _httpClient.GetFromJsonAsync<VacationPagedResponse>(url, ciOpts);
            Requests.Clear();
            if (result?.Data != null)
                foreach (var r in result.Data) Requests.Add(r);
            _hasMore = result?.HasMore ?? false;

            HasData      = Requests.Count > 0;
            IsEmptyState = Requests.Count == 0;
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
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(VacationListViewModel));
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

    [RelayCommand]
    private async Task LoadMoreAsync()
    {
        if (IsLoadingMore || !_hasMore || IsBusy) return;
        IsLoadingMore = true;
        try
        {
            _currentPage++;
            var url = $"api/vacation-requests?page={_currentPage}&pageSize=20";
            if (FilterStatus != "All") url += $"&status={FilterStatus}";
            var ciOpts = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var result = await _httpClient.GetFromJsonAsync<VacationPagedResponse>(url, ciOpts);
            if (result?.Data != null)
                foreach (var r in result.Data) Requests.Add(r);
            _hasMore = result?.HasMore ?? false;
        }
        catch (HttpRequestException) { }
        catch (TaskCanceledException) { }
        finally { IsLoadingMore = false; }
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
    private void SetFilterIndex(string indexStr)
    {
        if (int.TryParse(indexStr, out var i))
            FilterIndex = i;
    }

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
            catch (HttpRequestException) { }
            catch (System.Text.Json.JsonException) { }
            catch (TaskCanceledException) { }
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
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (System.Text.Json.JsonException) { await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
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
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
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
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
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
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
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
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
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

    [RelayCommand]
    private async Task GoToDashAsync()
        => await Shell.Current.GoToAsync(IsAdmin ? "//Dashboard" : "//EmployeeDashboard");
    [RelayCommand]
    private async Task GoToShiftsAsync() => await Shell.Current.GoToAsync("//Shifts");
    [RelayCommand]
    private async Task GoToThirdTabAsync()
        => await Shell.Current.GoToAsync(IsAdmin ? "//Team" : "//Notifications");
    [RelayCommand]
    private async Task GoToProfileAsync() => await Shell.Current.GoToAsync("//Profile");
}
