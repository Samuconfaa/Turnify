using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public partial class AvailabilityViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;

    [ObservableProperty] private bool _monday    = true;
    [ObservableProperty] private bool _tuesday   = true;
    [ObservableProperty] private bool _wednesday = true;
    [ObservableProperty] private bool _thursday  = true;
    [ObservableProperty] private bool _friday    = true;
    [ObservableProperty] private bool _saturday  = false;
    [ObservableProperty] private bool _sunday    = false;

    public AvailabilityViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Disponibilità";
    }

    [RelayCommand]
    public async Task LoadAsync()
    {
        if (IsBusy) return;
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var dto = await _httpClient.GetFromJsonAsync<AvailabilityDto>("api/employees/me/availability");
            if (dto?.AvailableDays != null)
            {
                ApplyDays(dto.AvailableDays);
                HasData = true;
                IsEmptyState = false;
            }
            else
            {
                HasData = false;
                IsEmptyState = true;
            }
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
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(AvailabilityViewModel));
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
    private async Task SaveAsync()
    {
        try
        {
            IsBusy = true;
            var days = BuildDaysString();
            var response = await _httpClient.PutAsJsonAsync(
                "api/employees/me/availability", new { availableDays = days });
            if (response.IsSuccessStatusCode)
                await Shell.Current.GoToAsync("..");
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile salvare la disponibilità.", "OK");
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (System.Text.Json.JsonException ex)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(AvailabilityViewModel));
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }

    private void ApplyDays(string days)
    {
        var parts = days.Split(',');
        bool Has(string d) => Array.Exists(parts, p => p.Trim() == d);
        Monday    = Has("1");
        Tuesday   = Has("2");
        Wednesday = Has("3");
        Thursday  = Has("4");
        Friday    = Has("5");
        Saturday  = Has("6");
        Sunday    = Has("0");
    }

    private string BuildDaysString()
    {
        var list = new System.Collections.Generic.List<string>();
        if (Monday)    list.Add("1");
        if (Tuesday)   list.Add("2");
        if (Wednesday) list.Add("3");
        if (Thursday)  list.Add("4");
        if (Friday)    list.Add("5");
        if (Saturday)  list.Add("6");
        if (Sunday)    list.Add("0");
        return string.Join(",", list);
    }

    private class AvailabilityDto
    {
        [JsonPropertyName("availableDays")]
        public string? AvailableDays { get; set; }
    }
}
