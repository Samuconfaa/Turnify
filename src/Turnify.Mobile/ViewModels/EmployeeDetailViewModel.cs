using System;
using System.Collections.ObjectModel;
using System.Linq;
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

public class NullableBusinessItem
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

[QueryProperty(nameof(EmployeeId), "employeeId")]
public partial class EmployeeDetailViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private int _employeeId;
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;
    [ObservableProperty] private string _jobRole = string.Empty;
    [ObservableProperty] private decimal _weeklyHours = 40;
    [ObservableProperty] private bool _isActive = true;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private NullableBusinessItem? _selectedBusiness;
    [ObservableProperty] private string _selectedContractType = "FullTime";

    public ObservableCollection<NullableBusinessItem> Businesses { get; } = new();
    public ObservableCollection<string> ContractTypes { get; } = new()
        { "FullTime", "PartTime", "Apprenticeship", "FixedTerm", "OnCall" };
    public ObservableCollection<string> ContractTypesDisplay { get; } = new()
        { "Tempo pieno", "Part-time", "Apprendistato", "Tempo determinato", "A chiamata" };

    public bool IsEditMode  => EmployeeId > 0;
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

            // Load businesses
            var businesses = await _httpClient.GetFromJsonAsync<BusinessItemDto[]>("api/businesses");
            Businesses.Clear();
            // "Nessuna attività" option
            Businesses.Add(new NullableBusinessItem { Id = null, Name = "— Nessuna attività —" });
            if (businesses != null)
                foreach (var b in businesses)
                    Businesses.Add(new NullableBusinessItem { Id = b.Id, Name = b.Name });

            SelectedBusiness = Businesses[0];

            if (IsEditMode)
            {
                var emp = await _httpClient.GetFromJsonAsync<EmployeeDetailDto>($"api/employees/{EmployeeId}");
                if (emp != null)
                {
                    FirstName  = emp.FirstName;
                    LastName   = emp.LastName;
                    Email      = emp.Email;
                    Phone      = emp.Phone;
                    JobRole    = emp.Role;
                    WeeklyHours = emp.WeeklyHours;
                    IsActive   = emp.IsActive;
                    SelectedContractType = emp.ContractType;
                    SelectedBusiness = emp.BusinessId.HasValue
                        ? Businesses.FirstOrDefault(b => b.Id == emp.BusinessId) ?? Businesses[0]
                        : Businesses[0];
                }
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", $"Impossibile caricare i dati: {ex.Message}", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task GoCreateBusinessAsync()
    {
        await Shell.Current.GoToAsync(nameof(Views.BusinessDetailPage));
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy) return;

        if (string.IsNullOrWhiteSpace(FirstName) || string.IsNullOrWhiteSpace(LastName) ||
            string.IsNullOrWhiteSpace(Email))
        {
            await Shell.Current.DisplayAlert("Campi mancanti", "Nome, cognome ed email sono obbligatori.", "OK");
            return;
        }
        if (IsCreateMode && string.IsNullOrWhiteSpace(Password))
        {
            await Shell.Current.DisplayAlert("Password mancante",
                "Inserisci una password temporanea da comunicare al dipendente.", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            var dto = new
            {
                firstName    = FirstName,
                lastName     = LastName,
                email        = Email,
                phone        = Phone,
                role         = JobRole,
                contractType = SelectedContractType,
                weeklyHours  = WeeklyHours,
                businessId   = SelectedBusiness?.Id,
                isActive     = IsActive,
                password     = Password
            };

            HttpResponseMessage response;
            if (IsCreateMode)
                response = await _httpClient.PostAsJsonAsync("api/employees", dto);
            else
                response = await _httpClient.PutAsJsonAsync($"api/employees/{EmployeeId}", dto);

            if (response.IsSuccessStatusCode)
            {
                if (IsCreateMode)
                {
                    await Shell.Current.DisplayAlert(
                        "✅ Dipendente creato!",
                        $"Comunica queste credenziali al dipendente:\n\n" +
                        $"📧 Email: {Email}\n" +
                        $"🔑 Password: {Password}\n\n" +
                        "Il dipendente potrà cambiarla dal suo profilo.",
                        "Ho capito");
                }
                await Shell.Current.GoToAsync("..");
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                await Shell.Current.DisplayAlert("Errore", "Email già in uso. Usa un'altra email.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlert("Errore", "Impossibile salvare il dipendente.", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Errore", ex.Message, "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (!IsEditMode) return;
        bool confirm = await Shell.Current.DisplayAlert(
            "Disattiva dipendente",
            $"Vuoi disattivare {FirstName} {LastName}? Lo storico turni verrà conservato.",
            "Sì, disattiva", "Annulla");
        if (!confirm) return;
        try
        {
            IsBusy = true;
            var r = await _httpClient.DeleteAsync($"api/employees/{EmployeeId}");
            if (r.IsSuccessStatusCode)
                await Shell.Current.GoToAsync("..");
            else
                await Shell.Current.DisplayAlert("Errore", "Impossibile disattivare il dipendente.", "OK");
        }
        catch { await Shell.Current.DisplayAlert("Errore", "Errore di connessione.", "OK"); }
        finally { IsBusy = false; }
    }

    private class BusinessItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
