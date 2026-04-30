using Microsoft.Maui.Controls;

namespace Turnify.Mobile.Services;

public class AppNavigationService : IAppNavigationService
{
    public Task NavigateToShellAsync(bool isAdmin, string startRoute = "Login")
    {
        Application.Current!.Windows[0].Page = new AppShell(isAdmin, startRoute);
        return Task.CompletedTask;
    }
}
