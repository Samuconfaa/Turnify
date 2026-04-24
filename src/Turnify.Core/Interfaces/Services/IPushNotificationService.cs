using System.Threading;
using System.Threading.Tasks;

namespace Turnify.Core.Interfaces.Services;

/// <summary>
/// Servizio per l'invio di notifiche push tramite Firebase Cloud Messaging (FCM).
/// </summary>
public interface IPushNotificationService
{
    /// <summary>
    /// Invia una notifica push a tutti i dispositivi registrati di un utente.
    /// Non lancia eccezioni in caso di fallimento — logga e continua.
    /// </summary>
    Task SendToUserAsync(int userId, string title, string body,
        string? entityType = null, int? entityId = null,
        CancellationToken ct = default);

    /// <summary>
    /// Registra o aggiorna il token FCM/APNs di un dispositivo.
    /// Se il token esiste già, aggiorna solo UpdatedAt.
    /// </summary>
    Task RegisterTokenAsync(int userId, string token, string platform,
        CancellationToken ct = default);

    /// <summary>
    /// Deregistra il token di un dispositivo (es. al logout).
    /// </summary>
    Task UnregisterTokenAsync(string token, CancellationToken ct = default);
}
