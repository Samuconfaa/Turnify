using Android.App;
using CommunityToolkit.Mvvm.Messaging;
using CommunityToolkit.Mvvm.Messaging.Messages;
using Plugin.Firebase.CloudMessaging;
using Turnify.Mobile.Messages;

namespace Turnify.Mobile;

/// <summary>
/// Riceve i push FCM quando l'app è in foreground e aggiorna il badge delle notifiche.
/// Plugin.Firebase gestisce automaticamente la visualizzazione della notifica di sistema
/// quando l'app è in background o chiusa.
/// </summary>
[Service(Exported = false)]
[Android.App.IntentFilter(new[] { "com.google.firebase.MESSAGING_EVENT" })]
public class TurnifyFirebaseMessagingService : FirebaseCloudMessagingServiceBase
{
    public override void OnNewToken(string token)
    {
        // Il token è stato aggiornato: forza ri-registrazione al prossimo login
        Microsoft.Maui.Storage.SecureStorage.Default.Remove("fcm_device_token");
    }

    public override void OnMessageReceived(FCMNotification notification)
    {
        // Segnala all'app che è arrivata una nuova notifica
        MainThread.BeginInvokeOnMainThread(() =>
        {
            WeakReferenceMessenger.Default.Send(new PushNotificationReceivedMessage());
        });
    }
}
