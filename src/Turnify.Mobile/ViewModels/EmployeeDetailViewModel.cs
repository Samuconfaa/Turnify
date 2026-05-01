using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class EmployeeDetailDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccountRole { get; set; } = "Employee";
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
    [ObservableProperty] private bool _hasError;
    // Saldo ferie
    [ObservableProperty] private string _holidayBalance   = string.Empty;
    [ObservableProperty] private string _paidLeaveBalance = string.Empty;
    [ObservableProperty] private bool _showEmployeeBalance;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _username = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;
    [ObservableProperty] private string _jobRole = string.Empty;
    [ObservableProperty] private decimal _weeklyHours = 40;
    [ObservableProperty] private bool _isActive = true;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private NullableBusinessItem? _selectedBusiness;
    [ObservableProperty] private string _selectedContractType = "FullTime";
    [ObservableProperty] private int _selectedContractTypeIndex;
    [ObservableProperty] private int _selectedAccountRoleIndex; // 0=Employee, 1=Manager

    public ObservableCollection<NullableBusinessItem> Businesses { get; } = new();
    public ObservableCollection<string> ContractTypes { get; } = new()
        { "FullTime", "PartTime", "Apprenticeship", "FixedTerm", "OnCall" };
    public ObservableCollection<string> ContractTypesDisplay { get; } = new()
        { "Tempo pieno", "Part-time", "Apprendistato", "Tempo determinato", "A chiamata" };
    public string[] AccountRoles        { get; } = { "Employee", "Manager" };
    public string[] AccountRolesDisplay { get; } = { "Dipendente", "Manager" };

    private string SelectedAccountRole =>
        AccountRoles.ElementAtOrDefault(SelectedAccountRoleIndex) ?? "Employee";

    partial void OnSelectedContractTypeIndexChanged(int value) =>
        SelectedContractType = ContractTypes.ElementAtOrDefault(value) ?? "FullTime";

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
        HasError = false;
        ErrorMessage = string.Empty;
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
                    Username   = emp.Username ?? string.Empty;
                    Email      = emp.Email ?? string.Empty;
                    Phone      = emp.Phone;
                    JobRole    = emp.Role;
                    WeeklyHours = emp.WeeklyHours;
                    IsActive   = emp.IsActive;
                    var contractIdx = ContractTypes.IndexOf(emp.ContractType);
                    SelectedContractTypeIndex = contractIdx >= 0 ? contractIdx : 0;
                    SelectedBusiness = emp.BusinessId.HasValue
                        ? Businesses.FirstOrDefault(b => b.Id == emp.BusinessId) ?? Businesses[0]
                        : Businesses[0];
                    SelectedAccountRoleIndex = emp.AccountRole == "Manager" ? 1 : 0;
                    HasData = true;
                    IsEmptyState = false;
                    await LoadBalanceAsync();
                }
                else
                {
                    HasData = false;
                    IsEmptyState = true;
                }
            }
            else
            {
                HasData = true;
                IsEmptyState = false;
            }
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (JsonException ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeDetailViewModel));
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
    private async Task GoCreateBusinessAsync()
    {
        await Shell.Current.GoToAsync(nameof(Views.BusinessDetailPage));
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy) return;

        if (string.IsNullOrWhiteSpace(FirstName) || string.IsNullOrWhiteSpace(LastName))
        {
            await Shell.Current.DisplayAlertAsync("Campi mancanti", "Nome e cognome sono obbligatori.", "OK");
            return;
        }
        if (string.IsNullOrWhiteSpace(Username))
        {
            await Shell.Current.DisplayAlertAsync("Nome utente mancante",
                "Inserisci un nome utente per il dipendente (verrà usato per accedere all'app).", "OK");
            return;
        }
        if (IsCreateMode && string.IsNullOrWhiteSpace(Password))
        {
            await Shell.Current.DisplayAlertAsync("Password mancante",
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
                username     = Username.Trim(),
                email        = string.IsNullOrWhiteSpace(Email) ? null : Email,
                phone        = Phone,
                role         = JobRole,
                accountRole  = SelectedAccountRole,
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
                    await Shell.Current.DisplayAlertAsync(
                        "✅ Dipendente creato!",
                        $"Comunica queste credenziali al dipendente:\n\n" +
                        $"👤 Nome utente: {Username.Trim()}\n" +
                        $"🔑 Password: {Password}\n\n" +
                        "Il dipendente accede con: nome azienda + nome utente + password.",
                        "Ho capito");
                }
                await Shell.Current.GoToAsync("..");
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Nome utente già in uso. Scegline un altro.", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile salvare il dipendente.", "OK");
            }
        }
        catch (HttpRequestException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK");
        }
        catch (JsonException ex)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Risposta del server non valida.", "OK");
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeDetailViewModel));
        }
        catch (TaskCanceledException)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK");
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task ResetPasswordAsync()
    {
        if (!IsEditMode) return;
        string? newPassword = await Shell.Current.DisplayPromptAsync(
            "Reimposta password",
            $"Inserisci la nuova password per {FirstName} {LastName}:",
            placeholder: "Minimo 6 caratteri",
            maxLength: 100);
        if (string.IsNullOrWhiteSpace(newPassword)) return;
        if (newPassword.Length < 6)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "La password deve essere di almeno 6 caratteri.", "OK");
            return;
        }
        try
        {
            IsBusy = true;
            var r = await _httpClient.PutAsJsonAsync(
                $"api/employees/{EmployeeId}/password", new { newPassword });
            if (r.IsSuccessStatusCode)
                await Shell.Current.DisplayAlertAsync("Password reimpostata",
                    $"Comunica la nuova password al dipendente:\n\n{newPassword}", "OK");
            else
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile reimpostare la password.", "OK");
        }
        catch (Exception ex) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione.", "OK"); _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeDetailViewModel)); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (!IsEditMode) return;
        bool confirm = await Shell.Current.DisplayAlertAsync(
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
                await Shell.Current.DisplayAlertAsync("Errore", "Impossibile disattivare il dipendente.", "OK");
        }
        catch (HttpRequestException) { await Shell.Current.DisplayAlertAsync("Errore", "Errore di connessione al server.", "OK"); }
        catch (TaskCanceledException) { await Shell.Current.DisplayAlertAsync("Errore", "Richiesta scaduta. Riprova.", "OK"); }
        finally { IsBusy = false; }
    }

    private async Task LoadBalanceAsync()
    {
        try
        {
            var bal = await _httpClient.GetFromJsonAsync<BalanceDto>($"api/vacation-balance/{EmployeeId}");
            if (bal == null) return;
            HolidayBalance   = $"🏖️ Ferie: {bal.Holiday.Remaining}/{bal.Holiday.Total} gg rimanenti";
            PaidLeaveBalance = $"📋 Permessi: {bal.PaidLeave.Remaining}/{bal.PaidLeave.Total} gg rimanenti";
            ShowEmployeeBalance = true;
        }
        catch { /* saldo non critico */ }
    }

    private class BalanceDto
    {
        public BalanceEntry Holiday   { get; set; } = new();
        public BalanceEntry PaidLeave { get; set; } = new();
        public class BalanceEntry
        {
            public int Total     { get; set; }
            public int Remaining { get; set; }
        }
    }

    private class BusinessItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
