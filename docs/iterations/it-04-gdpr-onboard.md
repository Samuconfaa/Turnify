# Iterazione 04

## Obiettivo
Implementare:
1. consenso GDPR al primo avvio,
2. onboarding guidato,
3. gestione dati personali,
4. preparazione notifiche push,
5. miglioramento del flusso login.

---

## Regole obbligatorie (NON violare)

- consenso privacy obbligatorio prima dell'uso dell'app
- marketing facoltativo e separato dal consenso privacy
- salvare solo preferenze minime in `Preferences`
- non bloccare il login se le notifiche push non sono disponibili
- non inserire logica nei code-behind
- mantenere UX coerente con app mobile
- evitare credenziali o token push hardcoded

---

# TASK 1 - Consenso GDPR

## File da creare/modificare
- `Turnify.Mobile/Views/GdprConsentPage.xaml`
- `Turnify.Mobile/ViewModels/GdprConsentViewModel.cs`
- `Turnify.Mobile/App.xaml.cs`
- `Turnify.Mobile/AppShell.xaml.cs`

## Cosa fare

1. Mostrare pagina consenso al primo avvio.
2. Richiedere checkbox privacy obbligatoria.
3. Rendere il consenso marketing opzionale.
4. Salvare versione consenso, data e preferenze in `Preferences`.
5. Se il consenso è già valido, saltare la pagina.

---

# TASK 2 - Onboarding guidato

## File da creare/modificare
- `Turnify.Mobile/Views/OnboardingPage.xaml`
- `Turnify.Mobile/ViewModels/OnboardingViewModel.cs`
- `Turnify.Mobile/AppShell.xaml.cs`

## Cosa fare

1. Creare schermata onboarding dopo consenso.
2. Mostrare passaggi essenziali per admin/dipendente.
3. Salvare completamento onboarding.
4. Navigare alla login o dashboard corretta.
5. Non ripetere onboarding se già completato.

---

# TASK 3 - Gestione dati personali

## File da creare/modificare
- `Turnify.Mobile/Views/ManageDataPage.xaml.cs`
- `Turnify.Mobile/ViewModels/ProfileViewModel.cs`
- `Turnify.Api/Controllers/UsersController.cs`

## Cosa fare

1. Preparare pagina gestione dati personali.
2. Esporre azioni per esportazione/cancellazione account se supportate.
3. Collegare accesso dalla pagina profilo.
4. Mostrare messaggi chiari se una funzione non è ancora disponibile.

---

# TASK 4 - Preparazione notifiche push

## Backend

### File da creare/modificare
- `Turnify.Core/Models/DeviceToken.cs`
- `Turnify.Core/Interfaces/Services/IPushNotificationService.cs`
- `Turnify.Core/Interfaces/Services/IDeviceTokenRepository.cs`
- `Turnify.Infrastructure/Repositories/DeviceTokenRepository.cs`
- `Turnify.Infrastructure/Services/FcmPushNotificationService.cs`
- `Turnify.Api/Controllers/DeviceTokensController.cs`
- `Turnify.Api/Program.cs`

### Cosa fare

1. Salvare device token associato a utente/azienda.
2. Esporre endpoint per registrare token.
3. Preparare servizio FCM.
4. Non fallire l'app se FCM non è configurato.

## Mobile

### File da creare/modificare
- `Turnify.Mobile/Services/MobilePushService.cs`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`

### Cosa fare

1. Preparare recupero token dispositivo.
2. Registrare token dopo login.
3. Gestire caso token non disponibile.
4. Non mostrare errori invasivi all'utente.

---

# TASK 5 - Refactor login

## File da modificare
- `Turnify.Mobile/Views/LoginPage.xaml`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`

## Cosa fare

1. Migliorare layout login.
2. Separare stati admin/dipendente se necessario.
3. Mantenere caricamento e messaggi errore.
4. Evitare duplicazione di logica.

---

# OUTPUT ATTESO

- GDPR mostrato e salvato correttamente
- onboarding presente
- profilo predisposto per gestione dati
- registrazione device token predisposta
- login più chiaro e stabile
- nessun crash se push notification non sono configurate

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
