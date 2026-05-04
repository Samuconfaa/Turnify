using System;
using Microsoft.Extensions.Logging;
using Turnify.Core.Interfaces.Services;
using Turnify.Mobile.Services;
using Turnify.Mobile.ViewModels;
using Turnify.Mobile.Views;

namespace Turnify.Mobile;

public static class MauiProgram
{
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

        // Services
        builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
        {
            // Base URL dell'API (su emulatore Android 10.0.2.2 mappa a localhost)
            client.BaseAddress = new Uri("http://10.0.2.2:5000"); 
        });

        // ViewModels
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<DashboardViewModel>();
        builder.Services.AddTransient<ShiftCalendarViewModel>();
        builder.Services.AddTransient<VacationListViewModel>();
        builder.Services.AddTransient<NotificationsViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();

        // Views
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<DashboardPage>();
        builder.Services.AddTransient<ShiftCalendarPage>();
        builder.Services.AddTransient<VacationListPage>();
        builder.Services.AddTransient<NotificationsPage>();
        builder.Services.AddTransient<ProfilePage>();

        return builder.Build();
    }
}
