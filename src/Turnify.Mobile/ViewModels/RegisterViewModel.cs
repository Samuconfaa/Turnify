using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Turnify.Mobile.ViewModels;

public class RegisterRequestDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string CompanySlug { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}

public partial class RegisterViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty]
    private string _companyName = string.Empty;

    [ObservableProperty]
    private string _companySlug = string.Empty;

    [ObservableProperty]
    private string _companyEmail = string.Empty;

    [ObservableProperty]
    private string _adminEmail = string.Empty;

    [ObservableProperty]
    private string _adminPassword = string.Empty;

    [ObservableProperty]
    private string _confirmPassword = string.Empty;

    public RegisterViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Registra Azienda";
    }

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (IsBusy) return;

        if (string.IsNullOrWhiteSpace(CompanyName) ||
            string.IsNullOrWhiteSpace(CompanySlug) ||
            string.IsNullOrWhiteSpace(CompanyEmail) ||
            string.IsNullOrWhiteSpace(AdminEmail) ||
            string.IsNullOrWhiteSpace(AdminPassword))
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Compila tutti i campi.", "OK");
            return;
        }

        if (AdminPassword != ConfirmPassword)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Le password non coincidono.", "OK");
            return;
        }

        try
        {
            IsBusy = true;
            var request = new RegisterRequestDto
            {
                CompanyName = CompanyName,
                CompanySlug = CompanySlug,
                CompanyEmail = CompanyEmail,
                AdminEmail = AdminEmail,
                AdminPassword = AdminPassword
            };

            var response = await _httpClient.PostAsJsonAsync("api/auth/register", request);

            if (response.IsSuccessStatusCode)
            {
                await Shell.Current.DisplayAlertAsync("Successo", "Azienda registrata correttamente! Ora puoi accedere.", "OK");
                await Shell.Current.GoToAsync("..");
            }
            else
            {
                var errorMessage = await GetErrorMessageAsync(response);
                await Shell.Current.DisplayAlertAsync("Errore", errorMessage, "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlertAsync("Errore", "Impossibile contattare il server.", "OK");
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(RegisterViewModel));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private static async Task<string> GetErrorMessageAsync(HttpResponseMessage response)
    {
        if (response.StatusCode == HttpStatusCode.Conflict)
            return "Esiste già un'azienda con lo stesso slug o un utente con la stessa email.";

        try
        {
            var body = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(body))
                return $"Registrazione fallita ({(int)response.StatusCode}).";

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            // FluentValidation returns { errors: { field: ["msg"] } }
            if (root.TryGetProperty("errors", out var errors))
            {
                var messages = new System.Text.StringBuilder();
                foreach (var prop in errors.EnumerateObject())
                    foreach (var msg in prop.Value.EnumerateArray())
                        messages.AppendLine(msg.GetString());
                var result = messages.ToString().Trim();
                if (!string.IsNullOrEmpty(result)) return result;
            }

            // ProblemDetails { detail: "..." }
            if (root.TryGetProperty("detail", out var detail) && detail.ValueKind == JsonValueKind.String)
                return detail.GetString() ?? $"Registrazione fallita ({(int)response.StatusCode}).";

            if (root.TryGetProperty("title", out var title) && title.ValueKind == JsonValueKind.String)
                return title.GetString() ?? $"Registrazione fallita ({(int)response.StatusCode}).";
        }
        catch { }

        return $"Registrazione fallita ({(int)response.StatusCode}).";
    }

    [RelayCommand]
    private async Task GoBackAsync()
    {
        await Shell.Current.GoToAsync("..");
    }
}
