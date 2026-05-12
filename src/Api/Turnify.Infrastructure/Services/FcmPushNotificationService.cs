using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Services;

/// <summary>
/// Implementazione del servizio notifiche push tramite Firebase Cloud Messaging (FCM) v1 API.
///
/// Setup necessario:
/// 1. Creare un progetto Firebase su https://console.firebase.google.com
/// 2. Aggiungere l'app Android (package: it.samuconfa.turnify.mobile)
/// 3. Scaricare google-services.json e aggiungerlo al progetto MAUI Android
/// 4. In Firebase Console → Project Settings → Service Accounts → Generate new private key
/// 5. Salvare il JSON nella config: Firebase:ServiceAccountJson
/// 6. Impostare Firebase:ProjectId con il tuo Project ID Firebase
/// </summary>
public class FcmPushNotificationService : IPushNotificationService
{
    private readonly IDeviceTokenRepository _deviceTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly TurnifyDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<FcmPushNotificationService> _logger;
    private readonly HttpClient _httpClient;

    // Cache del token OAuth2 per evitare richieste eccessive a Google
    private string? _cachedAccessToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public FcmPushNotificationService(
        IDeviceTokenRepository deviceTokenRepository,
        IUserRepository userRepository,
        TurnifyDbContext context,
        IConfiguration config,
        ILogger<FcmPushNotificationService> logger,
        HttpClient httpClient)
    {
        _deviceTokenRepository = deviceTokenRepository;
        _userRepository        = userRepository;
        _context               = context;
        _config                = config;
        _logger                = logger;
        _httpClient            = httpClient;
    }

    public async Task SendToUserAsync(
        int userId, string title, string body,
        string? entityType = null, int? entityId = null,
        CancellationToken ct = default)
    {
        // Salva sempre la notifica in-app, indipendentemente dal push
        await SaveInAppNotificationAsync(userId, title, body, entityType, entityId, ct);

        var tokens = await _deviceTokenRepository.GetActiveByUserIdAsync(userId, ct);
        if (tokens.Count == 0)
        {
            _logger.LogDebug("Nessun device token per userId={UserId}, solo in-app", userId);
            return;
        }

        var projectId = _config["Firebase:ProjectId"];
        if (string.IsNullOrEmpty(projectId))
        {
            _logger.LogWarning("Firebase:ProjectId non configurato — notifiche push disabilitate");
            return;
        }

        foreach (var deviceToken in tokens)
        {
            await SendFcmMessageAsync(deviceToken, title, body, entityType, entityId, projectId, ct);
        }
    }

    public async Task RegisterTokenAsync(
        int userId, string token, string platform,
        CancellationToken ct = default)
    {
        var existing = await _deviceTokenRepository.GetByTokenAsync(token, ct);

        if (existing != null)
        {
            // Token già presente: aggiorna timestamp e assicurati che sia attivo
            existing.IsActive  = true;
            existing.UpdatedAt = DateTime.UtcNow;
            await _deviceTokenRepository.UpdateAsync(existing, ct);
            return;
        }

        var devicePlatform = platform.Equals("ios", StringComparison.OrdinalIgnoreCase)
            ? DevicePlatform.iOS
            : DevicePlatform.Android;

        await _deviceTokenRepository.AddAsync(new DeviceToken
        {
            UserId    = userId,
            Token     = token,
            Platform  = devicePlatform,
            IsActive  = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }, ct);

        _logger.LogInformation("Token FCM registrato per userId={UserId} platform={Platform}",
            userId, platform);
    }

    public async Task UnregisterTokenAsync(string token, CancellationToken ct = default)
    {
        await _deviceTokenRepository.DeactivateAsync(token, ct);
        _logger.LogInformation("Token FCM deregistrato");
    }

    // ── Metodi privati ────────────────────────────────────────────

    private async Task SendFcmMessageAsync(
        DeviceToken deviceToken, string title, string body,
        string? entityType, int? entityId,
        string projectId, CancellationToken ct)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync(ct);
            if (accessToken == null) return;

            var url = $"https://fcm.googleapis.com/v1/projects/{projectId}/messages:send";

            var data = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(entityType)) data["entityType"] = entityType;
            if (entityId.HasValue) data["entityId"] = entityId.Value.ToString();

            var message = new FcmMessage
            {
                Message = new FcmMessageBody
                {
                    Token        = deviceToken.Token,
                    Notification = new FcmNotification { Title = title, Body = body },
                    Data         = data
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(message)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("FCM error per token {TokenId}: {Status} {Body}",
                    deviceToken.Id, response.StatusCode, errorBody);

                // Token non valido o scaduto: disattivalo
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound ||
                    errorBody.Contains("UNREGISTERED") ||
                    errorBody.Contains("INVALID_ARGUMENT"))
                {
                    await _deviceTokenRepository.DeactivateAsync(deviceToken.Token, ct);
                    _logger.LogInformation("Token FCM {TokenId} disattivato (non registrato)", deviceToken.Id);
                }
            }
            else
            {
                _logger.LogDebug("Push inviato a userId={UserId} tokenId={TokenId}",
                    deviceToken.UserId, deviceToken.Id);
            }
        }
        catch (Exception ex)
        {
            // Non propagare: un errore push non deve bloccare l'operazione principale
            _logger.LogError(ex, "Errore invio push a tokenId={TokenId}", deviceToken.Id);
        }
    }

    /// <summary>
    /// Ottiene un token OAuth2 valido per le FCM v1 API.
    /// Usa le Service Account credentials configurate in Firebase:ServiceAccountJson.
    /// </summary>
    private async Task<string?> GetAccessTokenAsync(CancellationToken ct)
    {
        if (_cachedAccessToken != null && DateTime.UtcNow < _tokenExpiry)
            return _cachedAccessToken;

        var serviceAccountJson = _config["Firebase:ServiceAccountJson"];
        if (string.IsNullOrEmpty(serviceAccountJson))
        {
            _logger.LogWarning("Firebase:ServiceAccountJson non configurato");
            return null;
        }

        try
        {
            // Usa Google.Apis.Auth per ottenere il token OAuth2
            // Pacchetto NuGet: Google.Apis.Auth
            var credential = Google.Apis.Auth.OAuth2.GoogleCredential
                .FromJson(serviceAccountJson)
                .CreateScoped("https://www.googleapis.com/auth/firebase.messaging");

            var token = await credential.UnderlyingCredential
                .GetAccessTokenForRequestAsync(cancellationToken: ct);

            _cachedAccessToken = token;
            _tokenExpiry       = DateTime.UtcNow.AddMinutes(55); // token Google dura 60 min

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore ottenimento token OAuth2 Firebase");
            return null;
        }
    }

    private async Task SaveInAppNotificationAsync(
        int userId, string title, string body,
        string? entityType, int? entityId, CancellationToken ct)
    {
        try
        {
            var notification = new Notification
            {
                RecipientUserId = userId,
                Type            = NotificationType.Info,
                Title           = title,
                Body            = body,
                IsRead          = false,
                EntityType      = entityType ?? string.Empty,
                EntityId        = entityId,
                CreatedAt       = DateTime.UtcNow,
                // CompanyId viene recuperato dall'utente
                CompanyId       = await GetCompanyIdForUserAsync(userId, ct)
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore salvataggio notifica in-app per userId={UserId}", userId);
        }
    }

    private async Task<int> GetCompanyIdForUserAsync(int userId, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        return user?.CompanyId ?? 0;
    }

    // ── DTO per FCM v1 API ────────────────────────────────────────

    private class FcmMessage
    {
        [JsonPropertyName("message")]
        public FcmMessageBody Message { get; set; } = new();
    }

    private class FcmMessageBody
    {
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;

        [JsonPropertyName("notification")]
        public FcmNotification Notification { get; set; } = new();

        [JsonPropertyName("data")]
        public Dictionary<string, string> Data { get; set; } = new();
    }

    private class FcmNotification
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;
    }
}
