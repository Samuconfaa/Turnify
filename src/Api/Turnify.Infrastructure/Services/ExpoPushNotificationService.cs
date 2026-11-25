using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Services;

public class ExpoPushNotificationService : IPushNotificationService
{
    private readonly IDeviceTokenRepository _deviceTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly TurnifyDbContext _context;
    private readonly ILogger<ExpoPushNotificationService> _logger;
    private readonly HttpClient _httpClient;

    private const string ExpoApiUrl = "https://exp.host/--/api/v2/push/send";

    public ExpoPushNotificationService(
        IDeviceTokenRepository deviceTokenRepository,
        IUserRepository userRepository,
        TurnifyDbContext context,
        ILogger<ExpoPushNotificationService> logger,
        HttpClient httpClient)
    {
        _deviceTokenRepository = deviceTokenRepository;
        _userRepository        = userRepository;
        _context               = context;
        _logger                = logger;
        _httpClient            = httpClient;
    }

    public async Task SendToUserAsync(
        int userId, string title, string body,
        string? entityType = null, int? entityId = null,
        CancellationToken ct = default)
    {
        await SaveInAppNotificationAsync(userId, title, body, entityType, entityId, ct);

        var tokens = await _deviceTokenRepository.GetActiveByUserIdAsync(userId, ct);
        if (tokens.Count == 0)
        {
            _logger.LogDebug("Nessun device token per userId={UserId}", userId);
            return;
        }

        var messages = tokens
            .Select(t => new ExpoPushMessage
            {
                To    = t.Token,
                Title = title,
                Body  = body,
                Data  = BuildData(entityType, entityId)
            })
            .ToList();

        await SendBatchAsync(messages, tokens, ct);
    }

    public async Task RegisterTokenAsync(
        int userId, string token, string platform,
        CancellationToken ct = default)
    {
        var existing = await _deviceTokenRepository.GetByTokenAsync(token, ct);

        if (existing != null)
        {
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

        _logger.LogInformation("Token Expo registrato userId={UserId} platform={Platform}", userId, platform);
    }

    public async Task UnregisterTokenAsync(string token, CancellationToken ct = default)
    {
        await _deviceTokenRepository.DeactivateAsync(token, ct);
        _logger.LogInformation("Token Expo deregistrato");
    }

    // ── Privati ──────────────────────────────────────────────────────

    private async Task SendBatchAsync(
        List<ExpoPushMessage> messages,
        IReadOnlyList<DeviceToken> tokens,
        CancellationToken ct)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(ExpoApiUrl, messages, ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Expo Push HTTP error {Status}: {Body}", response.StatusCode, body);
                return;
            }

            var result = await response.Content.ReadFromJsonAsync<ExpoPushResponse>(cancellationToken: ct);
            if (result?.Data == null) return;

            for (int i = 0; i < result.Data.Count && i < tokens.Count; i++)
            {
                var ticket = result.Data[i];
                if (ticket.Status != "error") continue;

                var error = ticket.Details?.Error;
                _logger.LogWarning("Expo Push ticket error tokenId={Id}: {Error}", tokens[i].Id, error);

                if (error is "DeviceNotRegistered" or "InvalidCredentials")
                {
                    await _deviceTokenRepository.DeactivateAsync(tokens[i].Token, ct);
                    _logger.LogInformation("Token Expo {Id} disattivato ({Error})", tokens[i].Id, error);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore invio batch Expo Push");
        }
    }

    private static Dictionary<string, string> BuildData(string? entityType, int? entityId)
    {
        var data = new Dictionary<string, string>();
        if (!string.IsNullOrEmpty(entityType)) data["entityType"] = entityType;
        if (entityId.HasValue) data["entityId"] = entityId.Value.ToString();
        return data;
    }

    private async Task SaveInAppNotificationAsync(
        int userId, string title, string body,
        string? entityType, int? entityId, CancellationToken ct)
    {
        try
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = userId,
                Type            = NotificationType.Info,
                Title           = title,
                Body            = body,
                IsRead          = false,
                EntityType      = entityType ?? string.Empty,
                EntityId        = entityId,
                CreatedAt       = DateTime.UtcNow,
                CompanyId       = await GetCompanyIdForUserAsync(userId, ct)
            });
            await _context.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore salvataggio notifica in-app userId={UserId}", userId);
        }
    }

    private async Task<int> GetCompanyIdForUserAsync(int userId, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        return user?.CompanyId ?? 0;
    }

    // ── DTO Expo Push API ─────────────────────────────────────────────

    private class ExpoPushMessage
    {
        [JsonPropertyName("to")]
        public string To { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public Dictionary<string, string> Data { get; set; } = new();

        [JsonPropertyName("sound")]
        public string Sound { get; set; } = "default";
    }

    private class ExpoPushResponse
    {
        [JsonPropertyName("data")]
        public List<ExpoPushTicket>? Data { get; set; }
    }

    private class ExpoPushTicket
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("details")]
        public ExpoPushTicketDetails? Details { get; set; }
    }

    private class ExpoPushTicketDetails
    {
        [JsonPropertyName("error")]
        public string? Error { get; set; }
    }
}
