using CommunityToolkit.Mvvm.Messaging;
using CommunityToolkit.Mvvm.Messaging.Messages;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;
using Turnify.Mobile.Messages;

namespace Turnify.Mobile;

public partial class AppShell : Shell
{
    /// <summary>
    /// startRoute: "GdprFirst" | "Login" | "Onboarding" | "Main"
    /// </summary>
    public AppShell(bool isAdmin = false, string startRoute = "RoleSelection")
    {
        InitializeComponent();
        RegisterAllRoutes();
        ConfigureForRole(isAdmin);

        // Aggiorna il badge quando NotificationsViewModel comunica il conteggio esatto
        WeakReferenceMessenger.Default.Register<ValueChangedMessage<int>>(this, (_, msg) =>
        {
            var count = msg.Value;
            NotificationsTab.Title = count > 0 ? $"Notifiche ({count})" : "Notifiche";
        });

        // Incrementa il badge immediatamente quando arriva un push (anche fuori dalla tab Notifiche)
        WeakReferenceMessenger.Default.Register<PushNotificationReceivedMessage>(this, (_, _) =>
        {
            var current = NotificationsTab.Title;
            var existing = 0;
            if (current.Contains('('))
            {
                var start = current.IndexOf('(') + 1;
                var end   = current.IndexOf(')');
                existing  = int.Parse(current.Substring(start, end - start));
            }
            NotificationsTab.Title = $"Notifiche ({existing + 1})";
        });

        // Naviga alla schermata iniziale corretta dopo l'init
        Dispatcher.Dispatch(async () =>
        {
            switch (startRoute)
            {
                case "GdprFirst":
                    await Shell.Current.GoToAsync(nameof(Views.GdprConsentPage));
                    break;
                case "Onboarding":
                    await Shell.Current.GoToAsync(nameof(Views.OnboardingPage));
                    break;
                case "Main":
                    await Shell.Current.GoToAsync(isAdmin ? "//Dashboard" : "//EmployeeDashboard");
                    break;
                case "Login":
                    await Shell.Current.GoToAsync(nameof(Views.LoginPage));
                    break;
                default: // "RoleSelection"
                    // RoleSelectionPage è già la prima ShellItem — nessuna navigazione necessaria
                    break;
            }
        });
    }

    private void RegisterAllRoutes()
    {
        // Auth
        Routing.RegisterRoute(nameof(Views.RoleSelectionPage),   typeof(Views.RoleSelectionPage));
        Routing.RegisterRoute(nameof(Views.LoginPage),           typeof(Views.LoginPage));
        Routing.RegisterRoute(nameof(Views.RegisterPage),        typeof(Views.RegisterPage));
        Routing.RegisterRoute(nameof(Views.ForgotPasswordPage),  typeof(Views.ForgotPasswordPage));

        // GDPR e Onboarding
        Routing.RegisterRoute(nameof(Views.GdprConsentPage), typeof(Views.GdprConsentPage));
        Routing.RegisterRoute(nameof(Views.OnboardingPage),  typeof(Views.OnboardingPage));

        // Main pages
        Routing.RegisterRoute(nameof(Views.DashboardPage),     typeof(Views.DashboardPage));
        Routing.RegisterRoute(nameof(Views.ShiftCalendarPage), typeof(Views.ShiftCalendarPage));
        Routing.RegisterRoute(nameof(Views.VacationListPage),  typeof(Views.VacationListPage));
        Routing.RegisterRoute(nameof(Views.VacationEditPage),  typeof(Views.VacationEditPage));
        Routing.RegisterRoute(nameof(Views.NotificationsPage), typeof(Views.NotificationsPage));
        Routing.RegisterRoute(nameof(Views.ProfilePage),       typeof(Views.ProfilePage));

        // Employees
        Routing.RegisterRoute(nameof(Views.EmployeeListPage),   typeof(Views.EmployeeListPage));
        Routing.RegisterRoute(nameof(Views.EmployeeDetailPage), typeof(Views.EmployeeDetailPage));

        // Shifts
        Routing.RegisterRoute(nameof(Views.ShiftDetailPage), typeof(Views.ShiftDetailPage));

        // Businesses
        Routing.RegisterRoute(nameof(Views.BusinessListPage),         typeof(Views.BusinessListPage));
        Routing.RegisterRoute(nameof(Views.BusinessDetailPage),       typeof(Views.BusinessDetailPage));
        Routing.RegisterRoute(nameof(Views.BusinessOpeningHoursPage), typeof(Views.BusinessOpeningHoursPage));

        // Profile extras
        Routing.RegisterRoute(nameof(Views.EmojiPickerPage),        typeof(Views.EmojiPickerPage));
        Routing.RegisterRoute(nameof(Views.ManageDataPage),         typeof(Views.ManageDataPage));
        Routing.RegisterRoute(nameof(Views.AvailabilityPage),       typeof(Views.AvailabilityPage));
        Routing.RegisterRoute(nameof(Views.EmployeeDashboardPage),  typeof(Views.EmployeeDashboardPage));
        Routing.RegisterRoute(nameof(Views.AttendanceHistoryPage),  typeof(Views.AttendanceHistoryPage));
        Routing.RegisterRoute(nameof(Views.ChangePasswordPage),     typeof(Views.ChangePasswordPage));
        Routing.RegisterRoute(nameof(Views.ReportsPage),            typeof(Views.ReportsPage));
        Routing.RegisterRoute(nameof(Views.EmployeeReportsPage),    typeof(Views.EmployeeReportsPage));
        Routing.RegisterRoute(nameof(Views.ShiftSwapsPage),         typeof(Views.ShiftSwapsPage));
        Routing.RegisterRoute("ShiftSwapRequestPage",               typeof(Views.ShiftSwapRequestPage));
    }

    public void ConfigureForRole(bool isAdmin)
    {
        if (!isAdmin)
        {
            // Rimuovi tab admin
            if (MainTabBar.Items.Contains(DashboardTab))
                MainTabBar.Items.Remove(DashboardTab);
            if (MainTabBar.Items.Contains(TeamTab))
                MainTabBar.Items.Remove(TeamTab);
        }
        else
        {
            // Ripristina tab admin
            if (!MainTabBar.Items.Contains(DashboardTab))
                MainTabBar.Items.Insert(0, DashboardTab);
            if (!MainTabBar.Items.Contains(TeamTab))
                MainTabBar.Items.Insert(1, TeamTab);

            // Rimuovi tab employee-only
            if (MainTabBar.Items.Contains(EmployeeDashboardTab))
                MainTabBar.Items.Remove(EmployeeDashboardTab);
        }
    }
}
