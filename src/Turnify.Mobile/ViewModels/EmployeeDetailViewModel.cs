using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class EmployeeDetailDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ContractType { get; set; } = "FullTime";
    public decimal WeeklyHours { get; set; }
    public bool IsActive { get; set; } = true;
    public int? BusinessId { get; set; }
    public string Password { get; set; } = string.Empty;
}

[QueryProperty(nameof(EmployeeId), "employeeId")]
public partial class EmployeeDetailViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    private int _employeeId;

    [ObservableProperty]
    private EmployeeDetailDto _employee = new();

    public ObservableCollection<BusinessItemDto> Businesses { get; } = new();

    [ObservableProperty]
    private BusinessItemDto? _selectedBusiness;

    public ObservableCollection<string> ContractTypes { get; } = new() { "FullTime", "PartTime" };

    [ObservableProperty]
    private string _selectedContractType = "FullTime";

    public bool IsEditMode => EmployeeId > 0;
    public bool IsCreateMode => !IsEditMode;

    public EmployeeDetailViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Nuovo Dipendente";
    }

    async partial void OnEmployeeIdChanged(int value)
    {
        Title = IsEditMode ? "Modifica Dipendente" : "Nuovo Dipendente";
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

            var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("/api/businesses");
            if (businesses != null)
            {
                Businesses.Clear();
                foreach (var b in businesses) Businesses.Add(b);
            }

            if (IsEditMode)
            {
                var emp = await _httpClient.GetFromJsonAsync<EmployeeDetailDto>($"/api/employees/{EmployeeId}");
                if (emp != null)
                {
                    Employee = emp;
                    SelectedContractType = emp.ContractType;
                    if (emp.BusinessId.HasValue)
                    {
                        foreach (var b in Businesses)
                        {
                            if (b.Id == emp.BusinessId.Value)
                            {
                                SelectedBusiness = b;
                                break;
                            }
                        }
                    }
                }
            }
        }
        catch (Exception)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Impossibile caricare i dati.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Employee.ContractType = SelectedContractType;
            Employee.BusinessId = SelectedBusiness?.Id;

            HttpResponseMessage response;
            if (IsCreateMode)
            {
                response = await _httpClient.PostAsJsonAsync("/api/employees", Employee);
                if (response.IsSuccessStatusCode)
                {
                    if (App.Current?.MainPage != null)
                        await App.Current.MainPage.DisplayAlert("Successo", $"Dipendente creato!\nEmail: {Employee.Email}\nPassword: {Employee.Password}", "OK");
                    await Shell.Current.GoToAsync("..");
                }
                else
                {
                    if (App.Current?.MainPage != null)
                        await App.Current.MainPage.DisplayAlert("Errore", "Impossibile creare il dipendente.", "OK");
                }
            }
            else
            {
                response = await _httpClient.PutAsJsonAsync($"/api/employees/{EmployeeId}", Employee);
                if (response.IsSuccessStatusCode)
                {
                    await Shell.Current.GoToAsync("..");
                }
                else
                {
                    if (App.Current?.MainPage != null)
                        await App.Current.MainPage.DisplayAlert("Errore", "Impossibile aggiornare il dipendente.", "OK");
                }
            }
        }
        catch (Exception)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Errore durante il salvataggio.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (IsBusy || !IsEditMode) return;

        if (App.Current?.MainPage != null)
        {
            bool confirm = await App.Current.MainPage.DisplayAlert("Conferma", "Sei sicuro di voler disattivare questo dipendente?", "Sì", "No");
            if (!confirm) return;
        }

        try
        {
            IsBusy = true;
            var response = await _httpClient.DeleteAsync($"/api/employees/{EmployeeId}");
            if (response.IsSuccessStatusCode)
            {
                await Shell.Current.GoToAsync("..");
            }
        }
        catch (Exception)
        {
            if (App.Current?.MainPage != null)
                await App.Current.MainPage.DisplayAlert("Errore", "Impossibile disattivare il dipendente.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }
}
