using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using Turnify.Mobile.ViewModels;
using Turnify.Mobile.Views;

namespace Turnify.Mobile;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        // Determina la schermata iniziale corretta
        var startPage = GetStartPage();
        return new Window(startPage);
    }

    /// <summary>
    /// Logica di routing all'avvio:
    /// 1. Se GDPR non ancora accettato → mostra GdprConsentPage (avviene una sola volta)
    /// 2. Se utente già loggato (token valido) → vai direttamente all'app
    /// 3. Altrimenti → mostra LoginPage (con link a registrazione)
    /// </summary>
    private Page GetStartPage()
    {
        // Passo 1: GDPR sempre prima di tutto, al primo avvio assoluto
        if (GdprConsentViewModel.NeedsConsent())
        {
            // Usa AppShell con navigazione verso GdprConsentPage
            // La GdprConsentPage dopo l'accettazione porta alla LoginPage
            var shell = new AppShell(isAdmin: false, startRoute: "GdprFirst");
            return shell;
        }

        // Passo 2: Controlla se c'è già un token salvato (utente già loggato)
        // Non possiamo fare async qui, usiamo Preferences come cache del ruolo
        var savedRole = Preferences.Default.Get("user_role_cached", string.Empty);
        var hasToken  = Preferences.Default.Get("has_valid_session", false);

        if (hasToken && !string.IsNullOrEmpty(savedRole))
        {
            bool isAdmin = savedRole == "Admin";

            // Se admin e onboarding non completato → onboarding
            if (isAdmin && OnboardingViewModel.NeedsOnboarding())
                return new AppShell(isAdmin: true, startRoute: "Onboarding");

            return new AppShell(isAdmin: isAdmin, startRoute: "Main");
        }

        // Passo 3: Nessuna sessione → Login (con possibilità di registrarsi)
        return new AppShell(isAdmin: false, startRoute: "Login");
    }
}
