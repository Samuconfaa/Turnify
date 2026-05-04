using System;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface IAuthService
{
    Task<(string AccessToken, string RefreshToken)?> LoginAsync(string email, string password, CancellationToken ct = default);
    Task<bool> RegisterCompanyAsync(Company company, User adminUser, CancellationToken ct = default);
    Task<(string AccessToken, string RefreshToken)?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<bool> LogoutAsync(int userId, CancellationToken ct = default);
    Task<bool> ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
}
