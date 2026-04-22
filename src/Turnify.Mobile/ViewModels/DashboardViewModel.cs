using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class DashboardShiftDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string DisplayTime => $"{StartTime:HH:mm} - {EndTime:HH:mm} · {Role}";
}

public class DashboardPendingVacationDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string DisplayDate => $"{StartDate:dd} - {EndDate:dd MMMM} · {Type}";
    public string Initials => EmployeeName.Length >= 2 ? EmployeeName.Substring(0, 2).ToUpper() : "??";
}

public class DashboardSummaryDto
{
    public int TotalEmployees { get; set; }
    public int ShiftsThisWeek { get; set; }
    public int PendingVacations { get; set; }
    public decimal TotalHoursScheduled { get; set; }
    public DashboardShiftDto[] ShiftsToday { get; set; } = Array.Empty<DashboardShiftDto>();
    public DashboardPendingVacationDto[] PendingRequests { get; set; } = Array.Empty<DashboardPendingVacationDto>();
}

public partial class DashboardViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    private int _totalEmployees;

    [ObservableProperty]
    private int _shiftsThisWeek;

    [ObservableProperty]
    private int _pendingVacations;

    [ObservableProperty]
    private decimal _totalHoursScheduled;

    public ObservableCollection<DashboardShiftDto> ShiftsToday { get; } = new();
    public ObservableCollection<DashboardPendingVacationDto> PendingRequests { get; } = new();

    public DashboardViewModel(IHttpClientFactory httpClientFactory)
    {
        Title = "Dashboard Admin";
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            
            var summary = await _httpClient.GetFromJsonAsync<DashboardSummaryDto>("api/dashboard/summary");
            if (summary != null)
            {
                TotalEmployees = summary.TotalEmployees;
                ShiftsThisWeek = summary.ShiftsThisWeek;
                PendingVacations = summary.PendingVacations;
                TotalHoursScheduled = summary.TotalHoursScheduled;

                ShiftsToday.Clear();
                foreach (var shift in summary.ShiftsToday)
                {
                    ShiftsToday.Add(shift);
                }

                PendingRequests.Clear();
                foreach (var req in summary.PendingRequests)
                {
                    PendingRequests.Add(req);
                }
            }
        }
        catch (Exception)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Impossibile caricare la dashboard.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }
}
