using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

/// <summary>
/// Servizio lato mobile per la gestione del token FCM.
/// 
/// Integrazione Firebase MAUI (da completare):
/// 1. Aggiungere il pacchetto NuGet: Plugin.Firebase.CloudMessaging
/// 2. Aggiungere google-services.json in Platforms/Android/ (Build Action: GoogleServicesJson)
/// 3. Aggiungere GoogleService-Info.plist in Platforms/iOS/ (Build Action: BundleResource)
/// 4. In MainActivity.cs aggiungere: FirebaseCloudMessagingImplementation.Initialize()
/// 5. Chiamare RegisterAsync() dopo il login riuscito
/// </summary>
public class MobilePushService
{
    private readonly HttpClient _httpClient;
    private const string TOKEN_KEY = "fcm_device_token";

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

            // Evita di re-registrare lo stesso token
            var lastToken = await SecureStorage.Default.GetAsync(TOKEN_KEY);
            if (lastToken == token) return;

            var platform = GetPlatform();
            var response = await _httpClient.PostAsJsonAsync("api/device-tokens", new
            {
                token    = token,
                platform = platform
            });

            if (response.IsSuccessStatusCode)
            {
                await SecureStorage.Default.SetAsync(TOKEN_KEY, token);
            }
        }
        catch (Exception ex)
        {
            // Non critico: il push funzionerà al prossimo avvio
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
            var token = await SecureStorage.Default.GetAsync(TOKEN_KEY);
            if (string.IsNullOrEmpty(token)) return;

            await _httpClient.SendAsync(new System.Net.Http.HttpRequestMessage(
                System.Net.Http.HttpMethod.Delete, "api/device-tokens")
            {
                Content = JsonContent.Create(new { token, platform = GetPlatform() })
            });

            SecureStorage.Default.Remove(TOKEN_KEY);
        }
        catch
        {
            // Silenzioso
        }
    }

    // ── Metodi privati ────────────────────────────────────────────

    private static async Task<string?> GetDeviceTokenAsync()
    {
        // Quando Plugin.Firebase.CloudMessaging è installato, sostituire con:
        // return await CrossFirebaseCloudMessaging.Current.GetTokenAsync();
        //
        // Per ora restituisce null (push disabilitati fino all'integrazione Firebase)
        await Task.CompletedTask;
        return null;
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
