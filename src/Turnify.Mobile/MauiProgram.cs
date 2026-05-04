using System;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Turnify.Core.Interfaces.Services;
using Turnify.Mobile.Services;
using Turnify.Mobile.ViewModels;
using Turnify.Mobile.Views;

namespace Turnify.Mobile;

public static class MauiProgram
{
    private const string API_BASE = "https://samuconfa.it/turnify/";

    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        builder.Services.AddTransient<AuthDelegatingHandler>();

        // Fix 1: SSL handler rimosso — non bypassare più la validazione certificato.
        // Se il certificato del VPS ha problemi, rinnovarlo con: sudo certbot renew
        // In DEBUG su emulatore Android può essere necessario aggiungere il certificato
        // di sviluppo alla catena di fiducia del device, non disabilitare la validazione.
        builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        builder.Services.AddHttpClient("TurnifyApi", client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .AddHttpMessageHandler<AuthDelegatingHandler>();

        // ── ViewModels ──────────────────────────────────────────────
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<DashboardViewModel>();
        builder.Services.AddTransient<ShiftCalendarViewModel>();
        builder.Services.AddTransient<ShiftDetailViewModel>();
        builder.Services.AddTransient<VacationListViewModel>();
        builder.Services.AddTransient<VacationEditViewModel>(); // Fix 3: era mancante
        builder.Services.AddTransient<NotificationsViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddTransient<EmployeeListViewModel>();
        builder.Services.AddTransient<EmployeeDetailViewModel>();
        builder.Services.AddTransient<BusinessListViewModel>();
        builder.Services.AddTransient<BusinessDetailViewModel>();
        builder.Services.AddTransient<BusinessOpeningHoursViewModel>();
        builder.Services.AddTransient<OnboardingViewModel>();   // nuovo — wizard
        builder.Services.AddTransient<GdprConsentViewModel>();  // nuovo — GDPR

        // ── Views ───────────────────────────────────────────────────
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<DashboardPage>();
        builder.Services.AddTransient<ShiftCalendarPage>();
        builder.Services.AddTransient<ShiftDetailPage>();
        builder.Services.AddTransient<VacationListPage>();
        builder.Services.AddTransient<VacationEditPage>();      // Fix 3: era mancante
        builder.Services.AddTransient<NotificationsPage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<EmployeeListPage>();
        builder.Services.AddTransient<EmployeeDetailPage>();
        builder.Services.AddTransient<EmojiPickerPage>();
        builder.Services.AddTransient<BusinessListPage>();
        builder.Services.AddTransient<BusinessDetailPage>();
        builder.Services.AddTransient<BusinessOpeningHoursPage>();
        builder.Services.AddTransient<OnboardingPage>();        // nuovo — wizard
        builder.Services.AddTransient<GdprConsentPage>();       // nuovo — GDPR

        return builder.Build();
    }
}
