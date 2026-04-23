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

        // Fix SSL: usa HttpClientHandler con bypass validazione certificato.
        // Necessario perché Android non accetta alcuni certificati intermedi.
        static HttpClientHandler CreateSslHandler() => new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (_, _, _, _) => true
        };

        builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        }).ConfigurePrimaryHttpMessageHandler(CreateSslHandler);

        builder.Services.AddHttpClient("TurnifyApi", client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .ConfigurePrimaryHttpMessageHandler(CreateSslHandler)
        .AddHttpMessageHandler<AuthDelegatingHandler>();

        // ── ViewModels ──────────────────────────────────────────────
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<DashboardViewModel>();
        builder.Services.AddTransient<ShiftCalendarViewModel>();
        builder.Services.AddTransient<ShiftDetailViewModel>();
        builder.Services.AddTransient<VacationListViewModel>();
        builder.Services.AddTransient<NotificationsViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddTransient<EmployeeListViewModel>();
        builder.Services.AddTransient<EmployeeDetailViewModel>();
        builder.Services.AddTransient<BusinessListViewModel>();
        builder.Services.AddTransient<BusinessDetailViewModel>();
        builder.Services.AddTransient<BusinessOpeningHoursViewModel>();

        // ── Views ───────────────────────────────────────────────────
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<DashboardPage>();
        builder.Services.AddTransient<ShiftCalendarPage>();
        builder.Services.AddTransient<ShiftDetailPage>();
        builder.Services.AddTransient<VacationListPage>();
        builder.Services.AddTransient<NotificationsPage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<EmployeeListPage>();
        builder.Services.AddTransient<EmployeeDetailPage>();
        builder.Services.AddTransient<EmojiPickerPage>();
        builder.Services.AddTransient<BusinessListPage>();
        builder.Services.AddTransient<BusinessDetailPage>();
        builder.Services.AddTransient<BusinessOpeningHoursPage>();

        return builder.Build();
    }
}