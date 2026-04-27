using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public partial class DayScheduleItemViewModel : ObservableObject
{
    private readonly string _dayKey;

    public string DayName { get; }

    [ObservableProperty]
    private bool _isOpen;

    [ObservableProperty]
    private TimeSpan _openTime = new TimeSpan(8, 0, 0);

    [ObservableProperty]
    private TimeSpan _closeTime = new TimeSpan(22, 0, 0);

    public DayScheduleItemViewModel(string dayKey, string dayName)
    {
        _dayKey = dayKey;
        DayName = dayName;
    }

    public string DayKey => _dayKey;
}

public class DayScheduleDto
{
    public bool IsOpen { get; set; }
    public string? Open { get; set; }
    public string? Close { get; set; }
}

[QueryProperty(nameof(BusinessId), "businessId")]
public partial class BusinessOpeningHoursViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;
    
    [ObservableProperty]
    private int _businessId;

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;

    public ObservableCollection<DayScheduleItemViewModel> Days { get; } = new();

    public BusinessOpeningHoursViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Orari di Apertura";
        
        Days.Add(new DayScheduleItemViewModel("monday", "Lunedì"));
        Days.Add(new DayScheduleItemViewModel("tuesday", "Martedì"));
        Days.Add(new DayScheduleItemViewModel("wednesday", "Mercoledì"));
        Days.Add(new DayScheduleItemViewModel("thursday", "Giovedì"));
        Days.Add(new DayScheduleItemViewModel("friday", "Venerdì"));
        Days.Add(new DayScheduleItemViewModel("saturday", "Sabato"));
        Days.Add(new DayScheduleItemViewModel("sunday", "Domenica"));
    }

    async partial void OnBusinessIdChanged(int value)
    {
        await LoadOpeningHoursAsync();
    }

    [RelayCommand]
    private async Task LoadOpeningHoursAsync()
    {
        if (IsBusy || BusinessId == 0) return;

        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;

            var response = await _httpClient.GetAsync($"api/businesses/{BusinessId}/opening-hours");

            if (response.IsSuccessStatusCode)
            {
                var dict = await response.Content.ReadFromJsonAsync<Dictionary<string, DayScheduleDto>>();
                if (dict != null)
                {
                    foreach (var day in Days)
                    {
                        if (dict.TryGetValue(day.DayKey, out var dto))
                        {
                            day.IsOpen = dto.IsOpen;
                            if (TimeSpan.TryParse(dto.Open, out var openTime))
                                day.OpenTime = openTime;
                            if (TimeSpan.TryParse(dto.Close, out var closeTime))
                                day.CloseTime = closeTime;
                        }
                    }
                    HasData = true;
                    IsEmptyState = false;
                }
                else
                {
                    HasData = false;
                    IsEmptyState = true;
                }
            }
            else
            {
                HasData = false;
                IsEmptyState = false;
                HasError = true;
                ErrorMessage = "Impossibile caricare gli orari.";
            }
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (JsonException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy || BusinessId == 0) return;

        try
        {
            IsBusy = true;

            var payload = new Dictionary<string, DayScheduleDto>();
            foreach (var day in Days)
            {
                payload[day.DayKey] = new DayScheduleDto
                {
                    IsOpen = day.IsOpen,
                    Open = day.IsOpen ? day.OpenTime.ToString(@"hh\:mm") : null,
                    Close = day.IsOpen ? day.CloseTime.ToString(@"hh\:mm") : null
                };
            }

            var response = await _httpClient.PutAsJsonAsync($"api/businesses/{BusinessId}/opening-hours", payload);

            if (response.IsSuccessStatusCode)
                await Shell.Current.DisplayAlertAsync("Successo", "Orari salvati correttamente.", "OK");
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Salvataggio fallito.", "OK");
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (JsonException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }
}
