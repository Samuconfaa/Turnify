using Microsoft.Maui.Controls;

namespace Turnify.Mobile;

public partial class AppShell : Shell
{
    public AppShell(bool isAdmin = false)
    {
        InitializeComponent();
        
        Routing.RegisterRoute(nameof(Views.LoginPage), typeof(Views.LoginPage));
        Routing.RegisterRoute(nameof(Views.RegisterPage), typeof(Views.RegisterPage));
        Routing.RegisterRoute(nameof(Views.DashboardPage), typeof(Views.DashboardPage));
        Routing.RegisterRoute(nameof(Views.ShiftCalendarPage), typeof(Views.ShiftCalendarPage));
        Routing.RegisterRoute(nameof(Views.VacationListPage), typeof(Views.VacationListPage));
        Routing.RegisterRoute(nameof(Views.NotificationsPage), typeof(Views.NotificationsPage));
        Routing.RegisterRoute(nameof(Views.ProfilePage), typeof(Views.ProfilePage));
        Routing.RegisterRoute(nameof(Views.EmployeeDetailPage), typeof(Views.EmployeeDetailPage));
        
        ConfigureForRole(isAdmin);
    }

    public void ConfigureForRole(bool isAdmin)
    {
        if (!isAdmin)
        {
            if (MainTabBar.Items.Contains(DashboardTab))
            {
                MainTabBar.Items.Remove(DashboardTab);
            }
            if (MainTabBar.Items.Contains(TeamTab))
            {
                MainTabBar.Items.Remove(TeamTab);
            }
        }
        else
        {
            if (!MainTabBar.Items.Contains(DashboardTab))
            {
                MainTabBar.Items.Insert(0, DashboardTab);
            }
            if (!MainTabBar.Items.Contains(TeamTab))
            {
                MainTabBar.Items.Insert(1, TeamTab);
            }
        }
    }
}
