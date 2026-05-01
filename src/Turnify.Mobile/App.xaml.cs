using Microsoft.Maui.Controls;
using Turnify.Mobile.Services;
using Turnify.Mobile.ViewModels;
using Turnify.Mobile.Views;

namespace Turnify.Mobile;

public partial class App : Application
{
    private readonly ISessionService _sessionService;
    private readonly IAppNavigationService _appNavigation;

    public App(ISessionService sessionService, IAppNavigationService appNavigation)
    {
        InitializeComponent();
        _sessionService = sessionService;
        _appNavigation  = appNavigation;
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        // GDPR deve essere accettato prima di qualsiasi altra schermata
        if (GdprConsentViewModel.NeedsConsent())
            return new Window(new AppShell(isAdmin: false, startRoute: "GdprFirst"));

        // Parte sempre con Login, poi verifica la sessione in background.
        // Se la sessione è valida, IAppNavigationService naviga a Main senza che
        // l'utente debba reinserire le credenziali.
        var shell = new AppShell(isAdmin: false, startRoute: "Login");

        shell.Dispatcher.Dispatch(async () =>
        {
            var (isValid, isAdmin) = await _sessionService.TryRestoreSessionAsync();
            if (!isValid) return;

            if (isAdmin && OnboardingViewModel.NeedsOnboarding())
                await _appNavigation.NavigateToShellAsync(isAdmin: true, startRoute: "Onboarding");
            else
                await _appNavigation.NavigateToShellAsync(isAdmin, startRoute: "Main");
        });

        return new Window(shell);
    }
}
