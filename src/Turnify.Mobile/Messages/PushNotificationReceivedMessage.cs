namespace Turnify.Mobile.Messages;

/// <summary>
/// Inviato via WeakReferenceMessenger quando arriva una notifica push FCM in foreground.
/// NotificationsViewModel lo riceve e ricarica la lista aggiornando il badge.
/// </summary>
public sealed class PushNotificationReceivedMessage { }
