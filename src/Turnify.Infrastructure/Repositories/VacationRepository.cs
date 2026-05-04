using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class VacationRepository : IVacationRepository
{
    private readonly TurnifyDbContext _context;

    public VacationRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<VacationRequest?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.VacationRequests.FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public async Task<IReadOnlyList<VacationRequest>> GetByCompanyAsync(int companyId, CancellationToken ct = default)
    {
        return await _context.VacationRequests
            .Where(v => v.CompanyId == companyId)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<VacationRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default)
    {
        return await _context.VacationRequests
            .Where(v => v.EmployeeId == employeeId)
            .ToListAsync(ct);
    }

    public async Task<VacationRequest> AddAsync(VacationRequest request, CancellationToken ct = default)
    {
        request.CreatedAt = System.DateTime.UtcNow;
        request.UpdatedAt = System.DateTime.UtcNow;
        _context.VacationRequests.Add(request);
        await _context.SaveChangesAsync(ct);
        return request;
    }

    public async Task<VacationRequest> UpdateAsync(VacationRequest request, CancellationToken ct = default)
    {
        request.UpdatedAt = System.DateTime.UtcNow;
        _context.VacationRequests.Update(request);
        await _context.SaveChangesAsync(ct);
        return request;
    }
}
