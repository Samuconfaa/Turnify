using Android.App;
using Android.Content.PM;
using Android.OS;
using CommunityToolkit.Mvvm.Messaging;
using Plugin.Firebase.CloudMessaging;
using Turnify.Mobile.Messages;

namespace Turnify.Mobile;

[Activity(
    Theme = "@style/Maui.SplashTheme",
    MainLauncher = true,
    LaunchMode = LaunchMode.SingleTop,
    ConfigurationChanges =
        ConfigChanges.ScreenSize | ConfigChanges.Orientation |
        ConfigChanges.UiMode | ConfigChanges.ScreenLayout |
        ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        FirebaseCloudMessagingImplementation.Initialize();

        // Notifica l'app quando arriva un push (app in foreground)
        CrossFirebaseCloudMessaging.Current.NotificationReceived += (_, _) =>
            MainThread.BeginInvokeOnMainThread(() =>
                WeakReferenceMessenger.Default.Send(new PushNotificationReceivedMessage()));

        // Token aggiornato: forza ri-registrazione al prossimo login
        CrossFirebaseCloudMessaging.Current.TokenRefreshed += (_, _) =>
            Microsoft.Maui.Storage.SecureStorage.Default.Remove("fcm_device_token");

        // Android 13+ richiede il permesso POST_NOTIFICATIONS a runtime
        if (Build.VERSION.SdkInt >= BuildVersionCodes.Tiramisu)
            RequestPermissions(new[] { Android.Manifest.Permission.PostNotifications }, 0);
    }
}
