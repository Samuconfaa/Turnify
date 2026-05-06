using System;

namespace Turnify.Core.Models;

/// <summary>
/// Token FCM/APNs registrato da un dispositivo mobile per ricevere notifiche push.
/// Un utente può avere più token attivi (es. telefono + tablet).
/// </summary>
public class DeviceToken
{
    public int Id { get; set; }

    /// <summary>Utente proprietario del dispositivo.</summary>
    public int UserId { get; set; }

    /// <summary>Token FCM (Android) o APNs (iOS).</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Piattaforma del dispositivo.</summary>
    public DevicePlatform Platform { get; set; }

    /// <summary>
    /// Indica se il token è ancora valido.
    /// Viene impostato a false quando FCM/APNs restituisce un errore di token non valido.
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public enum DevicePlatform
{
    Android,
    iOS
}
