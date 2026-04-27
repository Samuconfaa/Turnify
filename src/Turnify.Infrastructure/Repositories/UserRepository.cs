using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TurnifyDbContext _context;

    public UserRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        user.CreatedAt = System.DateTime.UtcNow;
        user.UpdatedAt = System.DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken ct = default)
    {
        user.UpdatedAt = System.DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync(ct);
        return user;
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        return _context.Users.AnyAsync(u => u.Email == email, ct);
    }

    public async Task<System.Collections.Generic.IReadOnlyList<User>> GetActiveUsersWithValidRefreshTokenAsync(CancellationToken ct = default)
    {
        return await _context.Users
            .Where(u => u.IsActive && u.RefreshTokenExpiryTime > System.DateTime.UtcNow)
            .ToListAsync(ct);
    }

    public async Task<System.Collections.Generic.IReadOnlyList<User>> GetUsersWithValidResetTokenAsync(CancellationToken ct = default)
    {
        return await _context.Users
            .Where(u => u.PasswordResetToken != null && u.PasswordResetTokenExpiryTime > System.DateTime.UtcNow)
            .ToListAsync(ct);
    }
}
