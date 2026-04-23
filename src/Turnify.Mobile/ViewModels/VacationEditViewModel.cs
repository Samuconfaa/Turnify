using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

[QueryProperty(nameof(RequestId), "requestId")]
public partial class VacationEditViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _requestId;
    [ObservableProperty] private string _employeeName = string.Empty;
    [ObservableProperty] private string _selectedType = "Holiday";
    [ObservableProperty] private DateTime _startDate = DateTime.Today;
    [ObservableProperty] private DateTime _endDate = DateTime.Today.AddDays(1);
    [ObservableProperty] private string _reason = string.Empty;
    [ObservableProperty] private string _selectedStatus = "Pending";
    [ObservableProperty] private string _reviewNote = string.Empty;

    public string[] VacationTypes        { get; } = { "Holiday", "PaidLeave", "SickLeave", "UnpaidLeave" };
    public string[] VacationTypesDisplay { get; } = { "Ferie", "Permesso Pagato", "Malattia", "Permesso Non Pagato" };
    public string[] StatusOptions        { get; } = { "Pending", "Approved", "Rejected", "Cancelled" };
    public string[] StatusOptionsDisplay { get; } = { "In Attesa", "Approvata", "Rifiutata", "Annullata" };

    public VacationEditViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Modifica Richiesta";
    }

    async partial void OnRequestIdChanged(int value)
    {
        if (value > 0) await LoadAsync();
    }

    private async Task LoadAsync()
    {
        try
        {
            IsBusy = true;
            var list = await _httpClient.GetFromJsonAsync<VacationRequestDto[]>(
                "api/vacation-requests?pageSize=200");
            var item = list?.FirstOrDefault(r => r.Id == RequestId);
            if (item == null) return;

            EmployeeName   = item.EmployeeName;
            SelectedType   = item.Type;
            StartDate      = item.StartDate;
            EndDate        = item.EndDate;
            Reason         = item.Reason;
            SelectedStatus = item.Status;
            ReviewNote     = item.ReviewNote ?? string.Empty;
        }
        catch { }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (EndDate < StartDate)
        {
            await Shell.Current.DisplayAlert("Errore", "La data di fine deve essere dopo la data di inizio.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var dto = new
            {
                type      = SelectedType,
                startDate = StartDate.Date,
                endDate   = EndDate.Date,
                totalDays = CountBusinessDays(StartDate, EndDate),
                reason    = Reason ?? string.Empty,
                status    = SelectedStatus
            };
            var r = await _httpClient.PutAsJsonAsync($"api/vacation-requests/{RequestId}", dto);
            if (r.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlert("Salvato", "Richiesta aggiornata.", "OK");
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                await Shell.Current.DisplayAlert("Errore", "Impossibile salvare.", "OK");
            }
        }
        catch (Exception ex) { await Shell.Current.DisplayAlert("Errore", ex.Message, "OK"); }
        finally { IsBusy = false; }
    }

    private static int CountBusinessDays(DateTime start, DateTime end)
    {
        int count = 0;
        for (var d = start; d <= end; d = d.AddDays(1))
            if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday)
                count++;
        return count;
    }

    private class VacationRequestDto
    {
        [JsonPropertyName("id")]           public int Id { get; set; }
        [JsonPropertyName("employeeName")] public string EmployeeName { get; set; } = string.Empty;
        [JsonPropertyName("type")]         public string Type { get; set; } = string.Empty;
        [JsonPropertyName("startDate")]    public DateTime StartDate { get; set; }
        [JsonPropertyName("endDate")]      public DateTime EndDate { get; set; }
        [JsonPropertyName("reason")]       public string Reason { get; set; } = string.Empty;
        [JsonPropertyName("status")]       public string Status { get; set; } = string.Empty;
        [JsonPropertyName("reviewNote")]   public string? ReviewNote { get; set; }
    }
}
