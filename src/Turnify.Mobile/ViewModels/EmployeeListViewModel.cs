using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Turnify.Mobile.Services;
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
    private readonly ICacheService _cache;
    private List<EmployeeListDto> _allEmployees = new();

    public ObservableCollection<EmployeeListDto> Employees { get; } = new();
    public ObservableCollection<BusinessItemDto> Businesses { get; } = new();

    [ObservableProperty]
    private BusinessItemDto? _selectedBusiness;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasEmployees))]
    private string _searchQuery = string.Empty;

    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;

    public bool HasEmployees => Employees.Count > 0;

    public EmployeeListViewModel(IHttpClientFactory httpClientFactory, ICacheService cache)
    {
        Title = "Team";
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        _cache = cache;
    }

    partial void OnSearchQueryChanged(string value) => ApplyFilter();

    private void ApplyFilter()
    {
        var q = SearchQuery?.Trim();
        var filtered = string.IsNullOrEmpty(q)
            ? _allEmployees
            : _allEmployees.Where(e =>
                e.FullName.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                e.Email.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                e.Role.Contains(q, StringComparison.OrdinalIgnoreCase)).ToList();

        Employees.Clear();
        foreach (var e in filtered) Employees.Add(e);
        OnPropertyChanged(nameof(HasEmployees));
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        HasError = false;
        ErrorMessage = string.Empty;

        var cached = await _cache.GetAsync<List<EmployeeListDto>>(CacheKeys.Employees);
        if (cached != null)
        {
            _allEmployees = cached;
            ApplyFilter();
            HasData = _allEmployees.Count > 0;
            IsEmptyState = _allEmployees.Count == 0;
        }
        else
        {
            IsBusy = true;
        }

        try
        {
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
                url += $"?businessId={SelectedBusiness.Id}";

            var emps = await _httpClient.GetFromJsonAsync<EmployeeListDto[]>(url);
            _allEmployees = emps?.ToList() ?? new List<EmployeeListDto>();
            await _cache.SetAsync(CacheKeys.Employees, _allEmployees, TimeSpan.FromMinutes(30));
            ApplyFilter();
            HasData = _allEmployees.Count > 0;
            IsEmptyState = _allEmployees.Count == 0;
            IsStale = false;
        }
        catch (HttpRequestException) when (cached != null)
        {
            IsStale = true;
        }
        catch (HttpRequestException)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (JsonException ex)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(EmployeeListViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false; IsEmptyState = false; HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public async Task RefreshAsync()
    {
        await _cache.InvalidateAsync(CacheKeys.Employees);
        IsStale = false;
        await LoadDataAsync();
    }

    public async Task InvalidateEmployeeCacheAsync()
        => await _cache.InvalidateAsync(CacheKeys.Employees);

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
    private async Task CreateEmployeeAsync()
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
