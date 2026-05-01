using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public class SessionService : ISessionService
{
    private const string ApiBase = "https://samuconfa.it/turnify/";

    public async Task<(bool IsValid, bool IsAdmin)> TryRestoreSessionAsync()
    {
        var accessToken = await SecureStorage.Default.GetAsync("jwt_token");

        if (!string.IsNullOrEmpty(accessToken) && !IsTokenExpired(accessToken))
        {
            var isAdmin = ExtractIsAdmin(accessToken);
            SyncPreferences(isAdmin);
            return (true, isAdmin);
        }

        var refreshToken = await SecureStorage.Default.GetAsync("refresh_token");
        if (string.IsNullOrEmpty(refreshToken))
        {
            ClearSession();
            return (false, false);
        }

        try
        {
            using var client = new HttpClient { BaseAddress = new Uri(ApiBase) };
            var resp = await client.PostAsJsonAsync("api/auth/refresh", new { refreshToken });
            if (!resp.IsSuccessStatusCode) { ClearSession(); return (false, false); }

            var result = await resp.Content.ReadFromJsonAsync<RefreshResponse>();
            if (result == null) { ClearSession(); return (false, false); }

            await SecureStorage.Default.SetAsync("jwt_token",     result.AccessToken);
            await SecureStorage.Default.SetAsync("refresh_token", result.RefreshToken);

            var admin = ExtractIsAdmin(result.AccessToken);
            SyncPreferences(admin);
            return (true, admin);
        }
        catch
        {
            ClearSession();
            return (false, false);
        }
    }

    private static bool IsTokenExpired(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length < 2) return true;

            var payload = parts[1];
            payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(payload));

            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("exp", out var exp))
            {
                var expiry = DateTimeOffset.FromUnixTimeSeconds(exp.GetInt64());
                return expiry < DateTimeOffset.UtcNow.AddSeconds(30);
            }
            return true;
        }
        catch { return true; }
    }

    private static bool ExtractIsAdmin(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var role = jwt.Claims.FirstOrDefault(c =>
                c.Type == "role" ||
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            return role == "Admin";
        }
        catch { return false; }
    }

    private static void SyncPreferences(bool isAdmin)
    {
        Preferences.Default.Set("user_role_cached",  isAdmin ? "Admin" : "Employee");
        Preferences.Default.Set("has_valid_session",  true);
        Preferences.Default.Set("user_role_cached",   isAdmin ? "Admin" : "Employee");
    }

    private static void ClearSession()
    {
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("refresh_token");
        SecureStorage.Default.Remove("user_role");
        Preferences.Default.Set("has_valid_session",  false);
        Preferences.Default.Set("user_role_cached",   string.Empty);
    }

    private record RefreshResponse(
        [property: JsonPropertyName("accessToken")]  string AccessToken,
        [property: JsonPropertyName("refreshToken")] string RefreshToken);
}
