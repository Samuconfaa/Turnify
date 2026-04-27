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

public class BusinessRepository : IBusinessRepository
{
    private readonly TurnifyDbContext _context;

    public BusinessRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<Business?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.Businesses.FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<IReadOnlyList<Business>> GetAllByCompanyIdAsync(int companyId, CancellationToken ct = default)
    {
        return await _context.Businesses
            .Where(b => b.CompanyId == companyId)
            .ToListAsync(ct);
    }

    public async Task<Business> AddAsync(Business business, CancellationToken ct = default)
    {
        business.CreatedAt = DateTime.UtcNow;
        business.UpdatedAt = DateTime.UtcNow;
        _context.Businesses.Add(business);
        await _context.SaveChangesAsync(ct);
        return business;
    }

    public async Task<Business> UpdateAsync(Business business, CancellationToken ct = default)
    {
        business.UpdatedAt = DateTime.UtcNow;
        _context.Businesses.Update(business);
        await _context.SaveChangesAsync(ct);
        return business;
    }
}
