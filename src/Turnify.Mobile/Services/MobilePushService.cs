using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public class MobilePushService
{
    private readonly HttpClient _httpClient;
    private const string TokenKey = "fcm_device_token";

    public MobilePushService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
    }

    /// <summary>
    /// Ottiene il token FCM dal device e lo registra sul backend.
    /// Va chiamato dopo ogni login riuscito.
    /// </summary>
    public async Task RegisterAsync()
    {
        try
        {
            var token = await GetDeviceTokenAsync();
            if (string.IsNullOrEmpty(token)) return;

            var lastToken = await SecureStorage.Default.GetAsync(TokenKey);
            if (lastToken == token) return;

            var response = await _httpClient.PostAsJsonAsync("api/device-tokens", new
            {
                token    = token,
                platform = GetPlatform()
            });

            if (response.IsSuccessStatusCode)
                await SecureStorage.Default.SetAsync(TokenKey, token);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[Push] Errore registrazione token: {ex.Message}");
        }
    }

    /// <summary>
    /// Deregistra il token al logout.
    /// </summary>
    public async Task UnregisterAsync()
    {
        try
        {
            var token = await SecureStorage.Default.GetAsync(TokenKey);
            if (string.IsNullOrEmpty(token)) return;

            await _httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Delete, "api/device-tokens")
            {
                Content = JsonContent.Create(new { token, platform = GetPlatform() })
            });

            SecureStorage.Default.Remove(TokenKey);
        }
        catch
        {
            // Silenzioso: il token verrà invalidato automaticamente dal backend
        }
    }

    private static async Task<string?> GetDeviceTokenAsync()
    {
#if ANDROID
        try
        {
            return await Plugin.Firebase.CloudMessaging.CrossFirebaseCloudMessaging.Current.GetTokenAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[Push] Errore get token FCM: {ex.Message}");
            return null;
        }
#else
        await Task.CompletedTask;
        return null;
#endif
    }

    private static string GetPlatform()
    {
#if ANDROID
        return "android";
#elif IOS
        return "ios";
#else
        return "android";
#endif
    }
}
