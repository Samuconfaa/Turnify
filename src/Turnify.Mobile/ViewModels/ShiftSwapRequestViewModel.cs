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

namespace Turnify.Mobile.ViewModels;

[QueryProperty(nameof(MyShiftId), "myShiftId")]
public partial class ShiftSwapRequestViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _myShiftId;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private string _note = string.Empty;
    [ObservableProperty] private SwapColleagueDto? _selectedColleague;
    [ObservableProperty] private SwapShiftDto? _selectedColleagueShift;

    public ObservableCollection<SwapColleagueDto> Colleagues { get; } = new();
    public ObservableCollection<SwapShiftDto> ColleagueShifts { get; } = new();

    public ShiftSwapRequestViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Proponi scambio";
    }

    public async Task OnAppearingAsync() => await LoadColleaguesAsync();

    private async Task LoadColleaguesAsync()
    {
        HasError = false;
        try
        {
            IsBusy = true;
            var emps = await _httpClient.GetFromJsonAsync<SwapColleagueDto[]>("api/employees");
            Colleagues.Clear();
            if (emps != null)
                foreach (var e in emps) Colleagues.Add(e);
            HasData = Colleagues.Count > 0;
            IsEmptyState = Colleagues.Count == 0;
        }
        catch (HttpRequestException) { HasError = true; ErrorMessage = "Errore di connessione."; }
        catch (TaskCanceledException) { HasError = true; ErrorMessage = "Richiesta scaduta."; }
        finally { IsBusy = false; }
    }

    partial void OnSelectedColleagueChanged(SwapColleagueDto? value)
    {
        if (value != null) _ = LoadColleagueShiftsAsync(value.Id);
    }

    private async Task LoadColleagueShiftsAsync(int employeeId)
    {
        ColleagueShifts.Clear();
        SelectedColleagueShift = null;
        var from = DateTime.Today.AddDays(-7);
        var to   = DateTime.Today.AddDays(21);
        try
        {
            var resp = await _httpClient.GetFromJsonAsync<ShiftsPage>(
                $"api/shifts?from={from:yyyy-MM-dd}&to={to:yyyy-MM-dd}&employeeId={employeeId}&pageSize=50");
            if (resp?.Data != null)
                foreach (var s in resp.Data) ColleagueShifts.Add(s);
        }
        catch { /* non critico */ }
    }

    [RelayCommand]
    private async Task SendAsync()
    {
        if (SelectedColleague == null)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Seleziona un collega.", "OK");
            return;
        }
        if (SelectedColleagueShift == null)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Seleziona il turno del collega.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var body = new
            {
                requestedEmployeeId = SelectedColleague.Id,
                shiftAId            = MyShiftId,
                shiftBId            = SelectedColleagueShift.Id,
                note                = Note
            };
            var resp = await _httpClient.PostAsJsonAsync("api/shift-swaps", body);
            if (resp.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync(
                    "Proposta inviata!",
                    $"Hai proposto uno scambio con {SelectedColleague.FullName}. " +
                    "Riceverai una notifica quando risponde.",
                    "OK");
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile inviare la proposta.", "OK");
            }
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); }
        finally { IsBusy = false; }
    }

    public class SwapColleagueDto
    {
        [JsonPropertyName("id")]        public int    Id        { get; set; }
        [JsonPropertyName("firstName")] public string FirstName { get; set; } = string.Empty;
        [JsonPropertyName("lastName")]  public string LastName  { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}";
    }

    public class SwapShiftDto
    {
        [JsonPropertyName("id")]        public int      Id        { get; set; }
        [JsonPropertyName("startTime")] public DateTime StartTime { get; set; }
        [JsonPropertyName("endTime")]   public DateTime EndTime   { get; set; }
        [JsonPropertyName("label")]     public string   Label     { get; set; } = string.Empty;
        public string DisplayLabel =>
            $"{StartTime.ToLocalTime():ddd dd/MM HH:mm} – {EndTime.ToLocalTime():HH:mm}" +
            (string.IsNullOrEmpty(Label) ? "" : $" ({Label})");
    }

    private class ShiftsPage
    {
        [JsonPropertyName("data")] public SwapShiftDto[]? Data { get; set; }
    }
}
