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

public class InviteRepository : IInviteRepository
{
    private readonly TurnifyDbContext _context;

    public InviteRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public async Task<Invite> AddAsync(Invite invite, CancellationToken ct = default)
    {
        invite.CreatedAt = DateTime.UtcNow;
        _context.Invites.Add(invite);
        await _context.SaveChangesAsync(ct);
        return invite;
    }

    public Task<Invite?> GetByCodeAsync(string code, CancellationToken ct = default)
        => _context.Invites.FirstOrDefaultAsync(i => i.Code == code, ct);

    public async Task<IReadOnlyList<Invite>> GetActiveByCompanyAsync(int companyId, CancellationToken ct = default)
        => await _context.Invites
            .Where(i => i.CompanyId == companyId && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

    public Task<Invite?> GetByIdAsync(int id, CancellationToken ct = default)
        => _context.Invites.FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task UpdateAsync(Invite invite, CancellationToken ct = default)
    {
        _context.Invites.Update(invite);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var invite = await _context.Invites.FindAsync(new object[] { id }, ct);
        if (invite != null)
        {
            _context.Invites.Remove(invite);
            await _context.SaveChangesAsync(ct);
        }
    }
}
