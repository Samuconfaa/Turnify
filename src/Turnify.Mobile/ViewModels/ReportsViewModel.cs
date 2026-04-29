using System;
using System.Net.Http;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.ViewModels;

public partial class ReportsViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    [ObservableProperty] private DateTime _fromDate = new(DateTime.Now.Year, DateTime.Now.Month, 1);
    [ObservableProperty] private DateTime _toDate   = DateTime.Today;
    [ObservableProperty] private bool     _hasError;
    [ObservableProperty] private string   _errorMessage = string.Empty;
    [ObservableProperty] private string   _successMessage = string.Empty;
    [ObservableProperty] private bool     _hasSuccess;

    public ReportsViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title       = "Report";
    }

    [RelayCommand]
    private async Task DownloadHoursAsync()
    {
        await DownloadReportAsync("hours", "ore-turni");
    }

    [RelayCommand]
    private async Task DownloadAttendanceAsync()
    {
        await DownloadReportAsync("attendance", "presenze");
    }

    private async Task DownloadReportAsync(string type, string filePrefix)
    {
        HasError   = false;
        HasSuccess = false;

        if (ToDate < FromDate)
        {
            HasError     = true;
            ErrorMessage = "La data di fine deve essere dopo la data di inizio.";
            return;
        }

        try
        {
            IsBusy = true;
            var from = Uri.EscapeDataString(FromDate.ToString("yyyy-MM-dd"));
            var to   = Uri.EscapeDataString(ToDate.ToString("yyyy-MM-dd"));

            var response = await _httpClient.GetAsync($"api/reports/{type}?from={from}&to={to}");

            if (!response.IsSuccessStatusCode)
            {
                HasError     = true;
                ErrorMessage = $"Errore {(int)response.StatusCode} dal server.";
                return;
            }

            var bytes = await response.Content.ReadAsByteArrayAsync();
            var fileName = $"{filePrefix}_{FromDate:yyyy-MM-dd}_{ToDate:yyyy-MM-dd}.csv";
            var path = System.IO.Path.Combine(FileSystem.CacheDirectory, fileName);
            await System.IO.File.WriteAllBytesAsync(path, bytes);

            await Share.RequestAsync(new ShareFileRequest
            {
                Title = $"Report {filePrefix}",
                File  = new ShareFile(path, "text/csv")
            });

            HasSuccess     = true;
            SuccessMessage = "Report pronto per la condivisione.";
        }
        catch (HttpRequestException)
        {
            HasError     = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (TaskCanceledException)
        {
            HasError     = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        catch (Exception ex)
        {
            HasError     = true;
            ErrorMessage = "Errore durante il download.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ReportsViewModel));
        }
        finally { IsBusy = false; }
    }
}
