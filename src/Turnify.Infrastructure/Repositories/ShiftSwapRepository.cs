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

public class ShiftSwapRepository : IShiftSwapRepository
{
    private readonly TurnifyDbContext _context;

    public ShiftSwapRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public async Task<ShiftSwapRequest> AddAsync(ShiftSwapRequest swap, CancellationToken ct = default)
    {
        swap.CreatedAt = DateTime.UtcNow;
        _context.ShiftSwapRequests.Add(swap);
        await _context.SaveChangesAsync(ct);
        return swap;
    }

    public Task<ShiftSwapRequest?> GetByIdAsync(int id, CancellationToken ct = default)
        => _context.ShiftSwapRequests.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<IReadOnlyList<ShiftSwapRequest>> GetByCompanyAsync(int companyId, CancellationToken ct = default)
    {
        // Ottieni tutti gli employeeId di questa company, poi filtra
        var employeeIds = await _context.Employees
            .Where(e => e.CompanyId == companyId)
            .Select(e => e.Id)
            .ToListAsync(ct);

        return await _context.ShiftSwapRequests
            .Where(s => employeeIds.Contains(s.RequestingEmployeeId))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ShiftSwapRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default)
        => await _context.ShiftSwapRequests
            .Where(s => s.RequestingEmployeeId == employeeId || s.RequestedEmployeeId == employeeId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);

    public async Task UpdateAsync(ShiftSwapRequest swap, CancellationToken ct = default)
    {
        _context.ShiftSwapRequests.Update(swap);
        await _context.SaveChangesAsync(ct);
    }
}
