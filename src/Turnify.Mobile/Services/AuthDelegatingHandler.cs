using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Maui;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public class AuthDelegatingHandler : DelegatingHandler
{
    private readonly IAppNavigationService _appNavigation;
    private const string ApiBase = "https://samuconfa.it/turnify/";

    private static readonly SemaphoreSlim _refreshLock = new(1, 1);
    private static bool _isRefreshing;

    public AuthDelegatingHandler(IAppNavigationService appNavigation)
    {
        _appNavigation = appNavigation;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = await SecureStorage.Default.GetAsync("jwt_token");
        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await base.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            var newToken = await TryRefreshAsync(cancellationToken);
            if (newToken != null)
            {
                var retry = await CloneRequestAsync(request);
                retry.Headers.Authorization = new AuthenticationHeaderValue("Bearer", newToken);
                response = await base.SendAsync(retry, cancellationToken);
            }
            else
            {
                await MainThread.InvokeOnMainThreadAsync(
                    () => _appNavigation.NavigateToShellAsync(false, "Login"));
            }
        }

        return response;
    }

    private static async Task<string?> TryRefreshAsync(CancellationToken ct)
    {
        await _refreshLock.WaitAsync(ct);
        try
        {
            if (_isRefreshing) return null;
            _isRefreshing = true;

            var refreshToken = await SecureStorage.Default.GetAsync("refresh_token");
            if (string.IsNullOrEmpty(refreshToken)) return null;

            using var client = new HttpClient { BaseAddress = new Uri(ApiBase) };
            var resp = await client.PostAsJsonAsync(
                "api/auth/refresh", new { refreshToken }, ct);
            if (!resp.IsSuccessStatusCode)
            {
                ClearSession();
                return null;
            }

            var result = await resp.Content.ReadFromJsonAsync<RefreshResponse>(cancellationToken: ct);
            if (result == null) { ClearSession(); return null; }

            await SecureStorage.Default.SetAsync("jwt_token",     result.AccessToken);
            await SecureStorage.Default.SetAsync("refresh_token", result.RefreshToken);
            return result.AccessToken;
        }
        catch
        {
            ClearSession();
            return null;
        }
        finally
        {
            _isRefreshing = false;
            _refreshLock.Release();
        }
    }

    private static void ClearSession()
    {
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("refresh_token");
        SecureStorage.Default.Remove("user_role");
        Preferences.Default.Set("has_valid_session", false);
        Preferences.Default.Set("user_role_cached", string.Empty);
    }

    private static async Task<HttpRequestMessage> CloneRequestAsync(HttpRequestMessage original)
    {
        var clone = new HttpRequestMessage(original.Method, original.RequestUri);
        if (original.Content != null)
        {
            var bytes = await original.Content.ReadAsByteArrayAsync();
            clone.Content = new ByteArrayContent(bytes);
            if (original.Content.Headers.ContentType != null)
                clone.Content.Headers.ContentType = original.Content.Headers.ContentType;
        }
        foreach (var header in original.Headers)
            clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
        clone.Version = original.Version;
        return clone;
    }

    private record RefreshResponse(
        [property: JsonPropertyName("accessToken")]  string AccessToken,
        [property: JsonPropertyName("refreshToken")] string RefreshToken);
}
