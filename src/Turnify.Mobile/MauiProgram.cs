using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;
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
                fonts.AddFont("PlusJakartaSans-Regular.ttf",   "PJSReg");
                fonts.AddFont("PlusJakartaSans-Medium.ttf",    "PJSMed");
                fonts.AddFont("PlusJakartaSans-SemiBold.ttf",  "PJSSemi");
                fonts.AddFont("PlusJakartaSans-Bold.ttf",      "PJSBold");
                fonts.AddFont("PlusJakartaSans-ExtraBold.ttf", "PJSXBold");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        builder.Services.AddTransient<AuthDelegatingHandler>();
        builder.Services.AddTransient<CertificatePinningHandler>();
        builder.Services.AddSingleton<IErrorReporterService, ErrorReporterService>();
        builder.Services.AddSingleton<IAppNavigationService, AppNavigationService>();
        builder.Services.AddSingleton<ISessionService,       SessionService>();
        builder.Services.AddSingleton<ICacheService,         CacheService>();
        builder.Services.AddSingleton<IMobilePushService, MobilePushService>();

        builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .ConfigurePrimaryHttpMessageHandler<CertificatePinningHandler>();

        builder.Services.AddHttpClient("TurnifyApi", client =>
        {
            client.BaseAddress = new Uri(API_BASE);
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .ConfigurePrimaryHttpMessageHandler<CertificatePinningHandler>()
        .AddHttpMessageHandler<AuthDelegatingHandler>();

        // ── ViewModels ──────────────────────────────────────────────
        builder.Services.AddTransient<RoleSelectionViewModel>();
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<DashboardViewModel>();
        builder.Services.AddTransient<ShiftCalendarViewModel>();
        builder.Services.AddTransient<ShiftDetailViewModel>();
        builder.Services.AddTransient<VacationListViewModel>();
        builder.Services.AddTransient<VacationEditViewModel>();
        builder.Services.AddTransient<NotificationsViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddTransient<EmployeeListViewModel>();
        builder.Services.AddTransient<EmployeeDetailViewModel>();
        builder.Services.AddTransient<BusinessListViewModel>();
        builder.Services.AddTransient<BusinessDetailViewModel>();
        builder.Services.AddTransient<BusinessOpeningHoursViewModel>();
        builder.Services.AddTransient<OnboardingViewModel>();
        builder.Services.AddTransient<GdprConsentViewModel>();
        builder.Services.AddTransient<AvailabilityViewModel>();
        builder.Services.AddTransient<ForgotPasswordViewModel>();
        builder.Services.AddTransient<EmployeeDashboardViewModel>();
        builder.Services.AddTransient<AttendanceHistoryViewModel>();
        builder.Services.AddTransient<ChangePasswordViewModel>();
        builder.Services.AddTransient<ReportsViewModel>();
        builder.Services.AddTransient<EmployeeReportsViewModel>();
        builder.Services.AddTransient<EmojiPickerViewModel>();
        builder.Services.AddTransient<ShiftSwapsViewModel>();
        builder.Services.AddTransient<ShiftSwapRequestViewModel>();

        // ── Views ───────────────────────────────────────────────────
        builder.Services.AddTransient<RoleSelectionPage>();
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<DashboardPage>();
        builder.Services.AddTransient<ShiftCalendarPage>();
        builder.Services.AddTransient<ShiftDetailPage>();
        builder.Services.AddTransient<VacationListPage>();
        builder.Services.AddTransient<VacationEditPage>();
        builder.Services.AddTransient<NotificationsPage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<EmployeeListPage>();
        builder.Services.AddTransient<EmployeeDetailPage>();
        builder.Services.AddTransient<EmojiPickerPage>();
        builder.Services.AddTransient<ManageDataPage>();
        builder.Services.AddTransient<BusinessListPage>();
        builder.Services.AddTransient<BusinessDetailPage>();
        builder.Services.AddTransient<BusinessOpeningHoursPage>();
        builder.Services.AddTransient<OnboardingPage>();
        builder.Services.AddTransient<GdprConsentPage>();
        builder.Services.AddTransient<AvailabilityPage>();
        builder.Services.AddTransient<ForgotPasswordPage>();
        builder.Services.AddTransient<EmployeeDashboardPage>();
        builder.Services.AddTransient<AttendanceHistoryPage>();
        builder.Services.AddTransient<ChangePasswordPage>();
        builder.Services.AddTransient<ReportsPage>();
        builder.Services.AddTransient<EmployeeReportsPage>();
        builder.Services.AddTransient<ShiftSwapsPage>();
        builder.Services.AddTransient<ShiftSwapRequestPage>();

        var app = builder.Build();

        // Inizializza l'accessor statico e registra i gestori globali di eccezioni
        var reporter = app.Services.GetRequiredService<IErrorReporterService>();
        ErrorReporterService.Current = reporter;

        AppDomain.CurrentDomain.UnhandledException += (_, args) =>
        {
            if (args.ExceptionObject is Exception ex)
                _ = reporter.ReportAsync(ex, screenName: "UnhandledException");
        };

        TaskScheduler.UnobservedTaskException += (_, args) =>
        {
            _ = reporter.ReportAsync(args.Exception, screenName: "UnobservedTask");
            args.SetObserved();
        };

        return app;
    }
}
