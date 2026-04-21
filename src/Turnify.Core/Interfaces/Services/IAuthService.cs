using System;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string password, CancellationToken ct = default);
    Task<bool> RegisterCompanyAsync(Company company, User adminUser, CancellationToken ct = default);
    Task<string?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
}
