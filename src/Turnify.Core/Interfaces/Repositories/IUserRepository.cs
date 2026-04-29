using System;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByUsernameInCompanyAsync(string username, int companyId, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsByUsernameInCompanyAsync(string username, int companyId, CancellationToken ct = default);
    Task<User> AddAsync(User user, CancellationToken ct = default);
    Task<User> UpdateAsync(User user, CancellationToken ct = default);
    Task<System.Collections.Generic.IReadOnlyList<User>> GetActiveUsersWithValidRefreshTokenAsync(CancellationToken ct = default);
    Task<System.Collections.Generic.IReadOnlyList<User>> GetUsersWithValidResetTokenAsync(CancellationToken ct = default);
}
