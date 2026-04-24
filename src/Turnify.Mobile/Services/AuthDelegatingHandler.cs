using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Maui;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public class AuthDelegatingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = await SecureStorage.Default.GetAsync("jwt_token");

        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await base.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
            MainThread.BeginInvokeOnMainThread(ClearSessionAndGoToLogin);

        return response;
    }

    private static void ClearSessionAndGoToLogin()
    {
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("refresh_token");
        SecureStorage.Default.Remove("user_role");
        Preferences.Default.Set("has_valid_session", false);
        Preferences.Default.Set("user_role_cached", string.Empty);

        if (Application.Current is not null)
            Application.Current.Windows[0].Page = new AppShell(isAdmin: false, startRoute: "Login");
    }
}
