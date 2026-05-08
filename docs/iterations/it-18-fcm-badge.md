# Iterazione 18

## Data
2026-05-09

## Commit
80751e2 — fix(mobile): correggi sintassi Range in AppShell badge counter

## Obiettivo
Completare l'integrazione FCM push sul mobile (F14 obbligatorio), aggiornare il badge notifiche in real-time e rimuovere il codice morto (geolocalizzazione e sistema inviti).

## Piano
1. Rimuovere codice morto: campi `CheckInLatitude`/`CheckInLongitude` da `AttendanceLog`, migration `CleanupDeadCode` per droppare colonne e tabella `Invites`
2. Aggiungere `Plugin.Firebase.CloudMessaging` NuGet e `google-services.json`
3. Implementare `MobilePushService.GetDeviceTokenAsync()` con `CrossFirebaseCloudMessaging`
4. Aggiornare `MainActivity` con init Firebase e richiesta permesso `POST_NOTIFICATIONS`
5. Collegare `MobilePushService.RegisterAsync()` al flusso di login in `LoginViewModel`
6. Aggiornare `NotificationsViewModel` per ricaricare lista su push ricevuto
7. Aggiornare `AppShell` per incrementare badge immediatamente su push in foreground

## Prompt principali utilizzati
- "cosa devo assolutamente implementare alla mia app che gli manca?"
- Implementazione FCM + badge real-time + rimozione codice morto in parallelo

## File creati/modificati
- `src/Api/Turnify.Core/Models/AttendanceLog.cs` — rimossi `CheckInLatitude`, `CheckInLongitude`
- `src/Api/Turnify.Infrastructure/Migrations/20260508212549_CleanupDeadCode.cs` — drop colonne geo + tabella Invites
- `src/Turnify.Mobile/Turnify.Mobile.csproj` — NuGet Firebase + GoogleServicesJson
- `src/Turnify.Mobile/Platforms/Android/google-services.json` — configurazione Firebase (non versionato)
- `src/Turnify.Mobile/Platforms/Android/MainActivity.cs` — eventi FCM + permesso notifiche
- `src/Turnify.Mobile/Platforms/Android/AndroidManifest.xml` — `POST_NOTIFICATIONS`
- `src/Turnify.Mobile/Services/MobilePushService.cs` — `GetDeviceTokenAsync()` implementato
- `src/Turnify.Mobile/Messages/PushNotificationReceivedMessage.cs` — nuovo messaggio WeakReferenceMessenger
- `src/Turnify.Mobile/ViewModels/LoginViewModel.cs` — chiama `RegisterAsync()` dopo login
- `src/Turnify.Mobile/ViewModels/NotificationsViewModel.cs` — `IRecipient<PushNotificationReceivedMessage>`
- `src/Turnify.Mobile/AppShell.xaml.cs` — badge incrementato in real-time su push in foreground

## Da completare in iterazione 19
- Fix warning CA1416 in `MainActivity.cs` (permesso POST_NOTIFICATIONS)
- Fix warning MVVMTK0034 in `ProfileViewModel.cs` (uso campo invece di property)
- Verifica flusso completo: admin crea turno → notifica appare nella tab dipendente
