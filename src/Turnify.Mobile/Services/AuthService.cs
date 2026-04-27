using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Microsoft.Maui.Storage;

namespace Turnify.Mobile.Services;

public class AuthService : IAuthService
{
    private readonly HttpClient _httpClient;
    
    public AuthService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        var response = await _httpClient.PostAsJsonAsync("api/auth/login", new { email, password }, ct);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: ct);
        if (result == null || string.IsNullOrEmpty(result.AccessToken))
            return null;

        await SecureStorage.Default.SetAsync("jwt_token", result.AccessToken);
        await SecureStorage.Default.SetAsync("refresh_token", result.RefreshToken);

        return (result.AccessToken, result.RefreshToken);
    }

    public Task<bool> RegisterCompanyAsync(Company company, User adminUser, CancellationToken ct = default)
    {
        throw new System.NotImplementedException();
    }

    public Task<(string AccessToken, string RefreshToken)?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        throw new System.NotImplementedException();
    }

    public Task<bool> LogoutAsync(int userId, CancellationToken ct = default)
        => throw new System.NotImplementedException();

    public async Task<bool> ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "api/auth/forgot-password", new { email }, ct);
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "api/auth/reset-password", new { token, newPassword }, ct);
        return response.IsSuccessStatusCode;
    }

    private class TokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
