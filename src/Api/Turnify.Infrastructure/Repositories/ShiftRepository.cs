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

public class ShiftRepository : IShiftRepository
{
    private readonly TurnifyDbContext _context;

    public ShiftRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<Shift?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.Shifts.FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<IReadOnlyList<Shift>> GetByCompanyAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _context.Shifts
            .Where(s => s.CompanyId == companyId && s.StartTime >= from && s.EndTime <= to)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Shift>> GetByEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _context.Shifts
            .Where(s => s.EmployeeId == employeeId && s.StartTime >= from && s.EndTime <= to)
            .ToListAsync(ct);
    }

    public async Task<Shift> AddAsync(Shift shift, CancellationToken ct = default)
    {
        shift.CreatedAt = DateTime.UtcNow;
        shift.UpdatedAt = DateTime.UtcNow;
        _context.Shifts.Add(shift);
        await _context.SaveChangesAsync(ct);
        return shift;
    }

    public async Task<Shift> UpdateAsync(Shift shift, CancellationToken ct = default)
    {
        shift.UpdatedAt = DateTime.UtcNow;
        _context.Shifts.Update(shift);
        await _context.SaveChangesAsync(ct);
        return shift;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var shift = await GetByIdAsync(id, ct);
        if (shift == null) return false;

        _context.Shifts.Remove(shift);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public Task<bool> HasOverlapAsync(int employeeId, DateTime start, DateTime end, int? excludeShiftId, CancellationToken ct = default)
    {
        var query = _context.Shifts.Where(s => s.EmployeeId == employeeId);
        
        if (excludeShiftId.HasValue)
        {
            query = query.Where(s => s.Id != excludeShiftId.Value);
        }

        return query.AnyAsync(s => s.StartTime < end && s.EndTime > start, ct);
    }
}
