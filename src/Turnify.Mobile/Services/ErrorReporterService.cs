using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public interface IErrorReporterService
{
    Task ReportAsync(Exception ex, string? screenName = null);
    Task ReportAsync(string errorType, string message, string? stackTrace = null, string? screenName = null);
}

public class ErrorReporterService : IErrorReporterService
{
    private readonly IHttpClientFactory _factory;

    // Accessor statico per i ViewModel che non hanno DI injection
    public static IErrorReporterService? Current { get; set; }

    public ErrorReporterService(IHttpClientFactory factory)
    {
        _factory = factory;
    }

    public Task ReportAsync(Exception ex, string? screenName = null)
        => ReportAsync(ex.GetType().Name, ex.Message, ex.ToString(), screenName);

    public async Task ReportAsync(string errorType, string message, string? stackTrace = null, string? screenName = null)
    {
        try
        {
            var client = _factory.CreateClient("TurnifyApi");

            var payload = new
            {
                deviceId   = GetDeviceId(),
                platform   = DeviceInfo.Current.Platform.ToString(),
                appVersion = AppInfo.Current.VersionString,
                errorType,
                message,
                stackTrace,
                screenName,
                occurredAt = DateTime.UtcNow
            };

            // Fire-and-forget: non blocca l'UI, non lancia eccezioni se fallisce
            await client.PostAsJsonAsync("api/errorlogs", payload).ConfigureAwait(false);
        }
        catch
        {
            // Il logging non deve mai crashare l'app
        }
    }

    private static string GetDeviceId()
    {
        const string key = "device_id";
        var id = Preferences.Default.Get(key, string.Empty);
        if (!string.IsNullOrEmpty(id)) return id;

        id = Guid.NewGuid().ToString();
        Preferences.Default.Set(key, id);
        return id;
    }
}
