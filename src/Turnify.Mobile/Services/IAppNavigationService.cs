namespace Turnify.Mobile.Services;

public interface IAppNavigationService
{
    Task NavigateToShellAsync(bool isAdmin, string startRoute = "Login");
}
