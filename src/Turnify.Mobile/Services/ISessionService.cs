namespace Turnify.Mobile.Services;

public interface ISessionService
{
    Task<(bool IsValid, bool IsAdmin)> TryRestoreSessionAsync();
}
