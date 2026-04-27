# Matrice di Test — Turnify

**Versione:** 1.0  
**Legenda stati:** ✅ Passed | ❌ Failed | ⏳ In Progress | ⬜ Not Tested

---

## Categoria 1 — Login e Autenticazione

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| AUTH-01 | Login con credenziali corrette | Email e password valide | Token JWT restituito, redirect dashboard | 🔴 Critica | ⬜ |
| AUTH-02 | Login con password errata | Email corretta + password sbagliata | Errore 401, messaggio generico | 🔴 Critica | ⬜ |
| AUTH-03 | Login con email non esistente | Email sconosciuta | Errore 401, messaggio generico (no info leak) | 🔴 Critica | ⬜ |
| AUTH-04 | Login con email malformata | `nonsoemail` | Errore 400, validazione frontend | 🟡 Alta | ⬜ |
| AUTH-05 | Login con campi vuoti | Email e/o password vuoti | Bottone disabilitato o errore validazione | 🟡 Alta | ⬜ |
| AUTH-06 | Brute force protezione | 11 tentativi login falliti in 15 min | Rate limit 429 dopo il 10° | 🔴 Critica | ⬜ |
| AUTH-07 | Refresh token valido | Refresh token non scaduto | Nuovo access token restituito | 🔴 Critica | ⬜ |
| AUTH-08 | Refresh token scaduto (7gg) | Refresh token scaduto | Errore 401, utente al login | 🔴 Critica | ⬜ |
| AUTH-09 | Logout | Utente autenticato | Refresh token invalidato nel DB | 🟡 Alta | ⬜ |
| AUTH-10 | Accesso con token scaduto | Access token scaduto (15 min) | Errore 401, app usa refresh token | 🔴 Critica | ⬜ |

---

## Categoria 2 — Registrazione

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| REG-01 | Registrazione azienda completa | Dati azienda + admin validi | Account creato, email conferma, login automatico | 🔴 Critica | ⬜ |
| REG-02 | Email già esistente | Email già registrata | Errore 409, messaggio chiaro | 🔴 Critica | ⬜ |
| REG-03 | Password troppo corta | Password < 8 caratteri | Errore validazione, requisiti mostrati | 🟡 Alta | ⬜ |
| REG-04 | Password senza maiuscole | `password123` | Errore validazione | 🟡 Alta | ⬜ |
| REG-05 | Nome azienda vuoto | Campo obbligatorio vuoto | Errore validazione, campo evidenziato | 🟡 Alta | ⬜ |
| REG-06 | Email formato non valido | `mario@` | Errore validazione | 🟡 Alta | ⬜ |

---

## Categoria 3 — Creazione Turni

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| SHIFT-01 | Crea turno valido | Dipendente + orario valido | Turno creato, notifica dipendente, turno in calendario | 🔴 Critica | ⬜ |
| SHIFT-02 | Turno sovrapposto stesso dipendente | Orario che si sovrappone a turno esistente | Errore 409 con dettaglio sovrapposizione | 🔴 Critica | ⬜ |
| SHIFT-03 | Fine turno prima dell'inizio | `endTime < startTime` | Errore 400 validazione | 🔴 Critica | ⬜ |
| SHIFT-04 | Dipendente di altra azienda | `employeeId` di altra company | Errore 403 (IDOR protection) | 🔴 Critica | ⬜ |
| SHIFT-05 | Turno con etichetta e nota | Campi opzionali compilati | Salvati correttamente e visibili nel dettaglio | 🟢 Bassa | ⬜ |
| SHIFT-06 | Turno a mezzanotte (cross-day) | 22:00 → 06:00 giorno dopo | Gestito correttamente, non rilevato come sovrapposizione | 🟡 Alta | ⬜ |
| SHIFT-07 | Dipendente crea turno (non autorizzato) | Dipendente chiama POST /shifts | Errore 403 | 🔴 Critica | ⬜ |

---

## Categoria 4 — Modifica Turni

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| MOD-01 | Modifica orario turno esistente | Admin cambia orario | Turno aggiornato, dipendente notificato | 🔴 Critica | ⬜ |
| MOD-02 | Modifica turno di altra azienda | Admin accede a turno non suo | Errore 403 | 🔴 Critica | ⬜ |
| MOD-03 | Modifica genera sovrapposizione | Nuovo orario si sovrappone a turno esistente | Errore 409 | 🔴 Critica | ⬜ |
| MOD-04 | Annulla turno (soft delete) | Admin cancella turno | Status = Cancelled, dipendente notificato | 🟡 Alta | ⬜ |
| MOD-05 | Modifica turno già completato | Turno con status Completed | Errore 400 (regola business) | 🟡 Alta | ⬜ |

---

## Categoria 5 — Richieste Ferie

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| VAC-01 | Dipendente invia richiesta ferie | Date valide + tipo | Richiesta creata con status Pending, admin notificato | 🔴 Critica | ⬜ |
| VAC-02 | Admin approva richiesta | Admin clicca approva + nota | Status = Approved, dipendente notificato | 🔴 Critica | ⬜ |
| VAC-03 | Admin rifiuta richiesta | Admin clicca rifiuta + nota | Status = Rejected, dipendente notificato con nota | 🔴 Critica | ⬜ |
| VAC-04 | Data fine prima di inizio | `endDate < startDate` | Errore 400 | 🟡 Alta | ⬜ |
| VAC-05 | Richiesta su date già approvate | Date sovrapposte a ferie approvate | Warning o errore (definire regola) | 🟡 Alta | ⬜ |
| VAC-06 | Dipendente annulla richiesta pending | Richiesta ancora in Pending | Status = Cancelled | 🟡 Alta | ⬜ |
| VAC-07 | Dipendente annulla richiesta approvata | Richiesta già Approved | Errore 400 (non consentito) | 🟡 Alta | ⬜ |
| VAC-08 | Dipendente vede solo proprie richieste | Dipendente accede GET /vacation-requests | Solo sue richieste, non quelle dei colleghi | 🔴 Critica | ⬜ |

---

## Categoria 6 — Autorizzazioni e Ruoli

| ID | Scenario | Input | Output atteso | Priorità | Stato |
|---|---|---|---|---|---|
| ROLE-01 | Dipendente accede a endpoint admin | `GET /employees` come Employee | Errore 403 | 🔴 Critica | ⬜ |
| ROLE-02 | Admin accede a dati di altra azienda | `GET /employees` con company diversa | Solo dipendenti della propria azienda | 🔴 Critica | ⬜ |
| ROLE-03 | Richiesta senza token | Qualsiasi endpoint protetto senza JWT | Errore 401 | 🔴 Critica | ⬜ |
| ROLE-04 | Token di un utente disattivato | JWT valido ma `isActive = false` | Errore 401 | 🔴 Critica | ⬜ |
| ROLE-05 | Token con firma falsificata | JWT con secret sbagliato | Errore 401 | 🔴 Critica | ⬜ |
| ROLE-06 | Super Admin accede a tutte le aziende | GET /companies | Lista completa aziende | 🟡 Alta | ⬜ |

---

## Categoria 7 — Performance Base

| ID | Scenario | Metrica target | Note | Priorità | Stato |
|---|---|---|---|---|---|
| PERF-01 | Login API response time | < 500ms p95 | Incluso hashing BCrypt | 🟡 Alta | ⬜ |
| PERF-02 | GET /shifts (30 giorni) | < 300ms p95 | Con 10 dipendenti, connessione 4G | 🟡 Alta | ⬜ |
| PERF-03 | GET /shifts (30 giorni) con 50 dipendenti | < 800ms p95 | Stress test scalabilità | 🟢 Bassa | ⬜ |
| PERF-04 | Dashboard summary | < 500ms p95 | Query aggregazione | 🟡 Alta | ⬜ |
| PERF-05 | App startup a freddo | < 3 secondi | Dispositivo mid-range 2019 | 🟡 Alta | ⬜ |
| PERF-06 | Caricamento calendario app | < 1 secondo | Dopo login, 4G | 🟡 Alta | ⬜ |

---

## Categoria 8 — Errori di Rete

| ID | Scenario | Condizione | Comportamento atteso | Priorità | Stato |
|---|---|---|---|---|---|
| NET-01 | App senza connessione internet | Wi-Fi/dati disattivati | Messaggio chiaro "Nessuna connessione" | 🟡 Alta | ⬜ |
| NET-02 | Connessione lenta | Latenza > 3 secondi | Loading indicator visibile, no crash | 🟡 Alta | ⬜ |
| NET-03 | Server non raggiungibile (500) | Server down | Messaggio di errore generico, retry possibile | 🟡 Alta | ⬜ |
| NET-04 | Timeout richiesta | Richiesta > 30 secondi | Timeout gestito, messaggio utente | 🟢 Bassa | ⬜ |
| NET-05 | Sessione scaduta durante utilizzo | Token scaduto mid-session | Refresh automatico trasparente o redirect login | 🔴 Critica | ⬜ |

---

## Categoria 9 — UX Mobile

| ID | Scenario | Device | Comportamento atteso | Priorità | Stato |
|---|---|---|---|---|---|
| UX-01 | Onboarding prima apertura | iPhone 13 / Samsung S21 | Flusso registrazione completo in < 5 min | 🔴 Critica | ⬜ |
| UX-02 | Navigazione tab bar | Entrambi i SO | Cambio tab fluido, stato preservato | 🟡 Alta | ⬜ |
| UX-03 | Calendario scroll | Dispositivo mid-range | Scroll fluido senza jank | 🟡 Alta | ⬜ |
| UX-04 | Dark mode automatica | Impostazione OS | App segue tema OS correttamente | 🟡 Alta | ⬜ |
| UX-05 | Orientamento landscape | Tablet | Layout non si rompe | 🟢 Bassa | ⬜ |
| UX-06 | Font size accessibilità | iOS Dynamic Type Large | Testo leggibile, layout non rotto | 🟡 Alta | ⬜ |
| UX-07 | Back button Android | Android | Navigazione coerente con OS | 🟡 Alta | ⬜ |
| UX-08 | Notifica push tap | App in background | Apre la schermata corretta (deep link) | 🟡 Alta | ⬜ |

---

## Riepilogo

| Categoria | Totale test | Critica 🔴 | Alta 🟡 | Bassa 🟢 |
|---|---|---|---|---|
| Autenticazione | 10 | 7 | 3 | 0 |
| Registrazione | 6 | 1 | 5 | 0 |
| Creazione Turni | 7 | 5 | 1 | 1 |
| Modifica Turni | 5 | 3 | 2 | 0 |
| Ferie | 8 | 4 | 4 | 0 |
| Autorizzazioni | 6 | 5 | 1 | 0 |
| Performance | 6 | 0 | 4 | 2 |
| Errori Rete | 5 | 1 | 3 | 1 |
| UX Mobile | 8 | 1 | 5 | 2 |
| **Totale** | **61** | **27** | **28** | **6** |

**Criterio go-live:** 100% test Critici passati + 90% test Alta passati.
