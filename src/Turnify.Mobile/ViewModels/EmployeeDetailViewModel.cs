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
    public decimal WeeklyHours { get; set; } = 40;
    public bool IsActive { get; set; } = true;
    public int? BusinessId { get; set; }
    public string Password { get; set; } = string.Empty;
}

[QueryProperty(nameof(EmployeeId), "employeeId")]
public partial class EmployeeDetailViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _employeeId;
    [ObservableProperty] private EmployeeDetailDto _employee = new();
    [ObservableProperty] private BusinessItemDto? _selectedBusiness;
    [ObservableProperty] private string _selectedContractType = "FullTime";

    public ObservableCollection<BusinessItemDto> Businesses { get; } = new();
    public ObservableCollection<string> ContractTypes { get; } = new()
        { "FullTime", "PartTime", "Apprenticeship", "FixedTerm", "OnCall" };

    public ObservableCollection<string> ContractTypesDisplay { get; } = new()
        { "Tempo pieno", "Part-time", "Apprendistato", "Tempo determinato", "A chiamata" };

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

            var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("api/businesses");
            Businesses.Clear();
            if (businesses != null)
                foreach (var b in businesses) Businesses.Add(b);

            if (IsEditMode)
            {
                var emp = await _httpClient.GetFromJsonAsync<EmployeeDetailDto>($"api/employees/{EmployeeId}");
                if (emp != null)
                {
                    Employee = emp;
                    SelectedContractType = emp.ContractType;
                    SelectedBusiness = emp.BusinessId.HasValue
                        ? Businesses.FirstOrDefault(b => b.Id == emp.BusinessId.Value)
                        : null;
                }
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", $"Impossibile caricare i dati: {ex.Message}", "OK");
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

        // Validate required fields
        if (string.IsNullOrWhiteSpace(Employee.FirstName) ||
            string.IsNullOrWhiteSpace(Employee.LastName) ||
            string.IsNullOrWhiteSpace(Employee.Email))
        {
            await Shell.Current.DisplayAlert("Campi mancanti", "Nome, cognome ed email sono obbligatori.", "OK");
            return;
        }

        if (IsCreateMode && string.IsNullOrWhiteSpace(Employee.Password))
        {
            await Shell.Current.DisplayAlert("Password mancante", "Inserisci una password temporanea per il dipendente.", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            Employee.ContractType = SelectedContractType;
            Employee.BusinessId = SelectedBusiness?.Id;

            HttpResponseMessage response;

            if (IsCreateMode)
            {
                response = await _httpClient.PostAsJsonAsync("api/employees", Employee);

                if (response.IsSuccessStatusCode)
                {
                    // Fix 4: Show credentials to admin clearly
                    await Shell.Current.DisplayAlert(
                        "✅ Dipendente creato!",
                        $"Comunica queste credenziali al dipendente:\n\n" +
                        $"📧 Email: {Employee.Email}\n" +
                        $"🔑 Password: {Employee.Password}\n\n" +
                        $"Il dipendente potrà cambiarla dal suo profilo.",
                        "Ho capito");
                    await Shell.Current.GoToAsync("..");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    await Shell.Current.DisplayAlert("Errore",
                        response.StatusCode == System.Net.HttpStatusCode.BadRequest
                            ? "Email già in uso. Usa un'altra email."
                            : "Impossibile creare il dipendente.",
                        "OK");
                }
            }
            else
            {
                response = await _httpClient.PutAsJsonAsync($"api/employees/{EmployeeId}", Employee);
                if (response.IsSuccessStatusCode)
                    await Shell.Current.GoToAsync("..");
                else
                    await Shell.Current.DisplayAlert("Errore", "Impossibile aggiornare il dipendente.", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", $"Errore durante il salvataggio: {ex.Message}", "OK");
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

        bool confirm = await Shell.Current.DisplayAlert(
            "Disattiva dipendente",
            $"Vuoi disattivare {Employee.FirstName} {Employee.LastName}?\n" +
            "I turni storici verranno conservati.",
            "Sì, disattiva", "Annulla");
        if (!confirm) return;

        try
        {
            IsBusy = true;
            var response = await _httpClient.DeleteAsync($"api/employees/{EmployeeId}");
            if (response.IsSuccessStatusCode)
                await Shell.Current.GoToAsync("..");
            else
                await Shell.Current.DisplayAlert("Errore", "Impossibile disattivare il dipendente.", "OK");
        }
        catch
        {
            await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK");
        }
        finally
        {
            IsBusy = false;
        }
    }
}