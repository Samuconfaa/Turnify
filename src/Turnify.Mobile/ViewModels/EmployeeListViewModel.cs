using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Turnify.Mobile.Views;

namespace Turnify.Mobile.ViewModels;

public class EmployeeListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int? BusinessId { get; set; }
    
    public string FullName => $"{FirstName} {LastName}";
    public string Initials => $"{FirstName?.FirstOrDefault()}{LastName?.FirstOrDefault()}".ToUpper();
    public string StatusText => IsActive ? "Attivo" : "Inattivo";
}

public class BusinessItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public partial class EmployeeListViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public ObservableCollection<EmployeeListDto> Employees { get; } = new();
    public ObservableCollection<BusinessItemDto> Businesses { get; } = new();

    [ObservableProperty]
    private BusinessItemDto? _selectedBusiness;

    public EmployeeListViewModel(IHttpClientFactory httpClientFactory)
    {
        Title = "Team";
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;

            if (Businesses.Count == 0)
            {
                var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("api/businesses");
                if (businesses != null)
                {
                    Businesses.Clear();
                    Businesses.Add(new BusinessItemDto { Id = 0, Name = "Tutte le attività" });
                    foreach (var b in businesses) Businesses.Add(b);
                    SelectedBusiness = Businesses[0];
                }
            }

            string url = "api/employees";
            if (SelectedBusiness != null && SelectedBusiness.Id > 0)
            {
                url += $"?businessId={SelectedBusiness.Id}";
            }

            var emps = await _httpClient.GetFromJsonAsync<EmployeeListDto[]>(url);
            Employees.Clear();
            if (emps != null)
            {
                foreach (var e in emps) Employees.Add(e);
            }
        }
        catch (Exception)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Impossibile caricare i dipendenti.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    async partial void OnSelectedBusinessChanged(BusinessItemDto? value)
    {
        await LoadDataAsync();
    }

    [RelayCommand]
    private async Task AddEmployeeAsync()
    {
        await Shell.Current.GoToAsync(nameof(EmployeeDetailPage));
    }

    [RelayCommand]
    private async Task EditEmployeeAsync(EmployeeListDto emp)
    {
        if (emp == null) return;
        await Shell.Current.GoToAsync($"{nameof(EmployeeDetailPage)}?employeeId={emp.Id}");
    }
}
