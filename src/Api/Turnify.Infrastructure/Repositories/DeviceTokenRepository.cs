using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class DeviceTokenRepository : IDeviceTokenRepository
{
    private readonly TurnifyDbContext _context;

    public DeviceTokenRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<DeviceToken>> GetActiveByUserIdAsync(
        int userId, CancellationToken ct = default)
    {
        return await _context.DeviceTokens
            .Where(t => t.UserId == userId && t.IsActive)
            .ToListAsync(ct);
    }

    public Task<DeviceToken?> GetByTokenAsync(string token, CancellationToken ct = default)
    {
        return _context.DeviceTokens
            .FirstOrDefaultAsync(t => t.Token == token, ct);
    }

    public async Task<DeviceToken> AddAsync(DeviceToken deviceToken, CancellationToken ct = default)
    {
        _context.DeviceTokens.Add(deviceToken);
        await _context.SaveChangesAsync(ct);
        return deviceToken;
    }

    public async Task<DeviceToken> UpdateAsync(DeviceToken deviceToken, CancellationToken ct = default)
    {
        deviceToken.UpdatedAt = DateTime.UtcNow;
        _context.DeviceTokens.Update(deviceToken);
        await _context.SaveChangesAsync(ct);
        return deviceToken;
    }

    public async Task DeactivateAsync(string token, CancellationToken ct = default)
    {
        var deviceToken = await GetByTokenAsync(token, ct);
        if (deviceToken == null) return;

        deviceToken.IsActive  = false;
        deviceToken.UpdatedAt = DateTime.UtcNow;
        _context.DeviceTokens.Update(deviceToken);
        await _context.SaveChangesAsync(ct);
    }
}
