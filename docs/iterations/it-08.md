# Iterazione 08

## Obiettivo
Implementare:
1. hardening sicurezza API,
2. validazione input con FluentValidation,
3. error reporting client verso backend,
4. dashboard web error logs,
5. certificate pinning mobile,
6. suite test backend completa.

---

## Regole obbligatorie (NON violare)

- validare input lato server
- restituire errori standard e non stack trace
- non salvare informazioni sensibili nei log
- non bloccare l'app se error reporting fallisce
- mantenere certificate pinning configurabile
- non introdurre logica UI nei code-behind
- mantenere test automatici ripetibili

---

# TASK 1 - FluentValidation API

## File da creare/modificare
- `Turnify.Api/Validators/LoginRequestValidator.cs`
- `Turnify.Api/Validators/RegisterRequestValidator.cs`
- `Turnify.Api/Validators/CreateShiftRequestValidator.cs`
- `Turnify.Api/Validators/UpdateShiftRequestValidator.cs`
- `Turnify.Api/Validators/CreateVacationRequestValidator.cs`
- `Turnify.Api/Validators/CreateRecurringShiftsRequestValidator.cs`
- `Turnify.Api/Validators/ReportErrorRequestValidator.cs`
- `Turnify.Api/Program.cs`

## Cosa fare

1. Installare/configurare FluentValidation.
2. Registrare validazione automatica.
3. Validare email, password, date, intervalli e lunghezze.
4. Restituire `ValidationProblemDetails`.
5. Coprire casi edge principali.

---

# TASK 2 - Error reporting

## Backend

### File da creare/modificare
- `Turnify.Core/Models/AppErrorLog.cs`
- `Turnify.Core/Interfaces/Repositories/IAppErrorLogRepository.cs`
- `Turnify.Infrastructure/Repositories/AppErrorLogRepository.cs`
- `Turnify.Api/Controllers/ErrorLogsController.cs`
- migrazione per tabella error logs

### Cosa fare

1. Salvare errori client con campi controllati.
2. Validare platform, message, stack trace e screen name.
3. Proteggere endpoint con rate limiting.
4. Non accettare payload eccessivi.

## Mobile

### File da creare/modificare
- `Turnify.Mobile/Services/ErrorReporterService.cs`
- `Turnify.Mobile/MauiProgram.cs`
- ViewModel principali

### Cosa fare

1. Catturare eccezioni inattese nei ViewModel.
2. Inviare errore al backend in modo silenzioso.
3. Generare `device_id` persistente.
4. Non far crashare il flusso utente se invio log fallisce.

---

# TASK 3 - Dashboard error logs web

## File da modificare/creare
- pagine web admin error logs
- servizi client web
- componenti tabella/filter

## Cosa fare

1. Mostrare lista errori client.
2. Filtrare per platform/schermata.
3. Gestire browser compatibili con target configurato.
4. Evitare crash su strutture dati non supportate.

---

# TASK 4 - Certificate pinning mobile

## File da creare/modificare
- `Turnify.Mobile/Services/CertificatePinningHandler.cs`
- `Turnify.Mobile/MauiProgram.cs`
- configurazione Android se necessaria

## Cosa fare

1. Aggiungere handler HTTP con controllo pin certificato.
2. Applicarlo solo dove appropriato.
3. Permettere sviluppo locale senza blocchi inutili.
4. Documentare rinnovo del pin.

---

# TASK 5 - Suite test completa

## File da creare/modificare
- test integration controller principali
- test repository principali
- test middleware
- test service

## Cosa fare

1. Coprire auth, turni, ferie, presenze, error logs.
2. Coprire repository con database di test.
3. Coprire middleware eccezioni.
4. Coprire casi di validazione.
5. Mantenere tutti i test deterministici.

---

# OUTPUT ATTESO

- validazione API completa
- error reporting client/backend funzionante
- dashboard web error logs consultabile
- certificate pinning predisposto
- suite test backend estesa
- regressioni critiche coperte
- nessun dato sensibile nei log

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
