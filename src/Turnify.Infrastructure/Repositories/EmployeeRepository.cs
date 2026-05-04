using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly TurnifyDbContext _context;

    public EmployeeRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<Employee?> GetByUserIdAsync(int userId, CancellationToken ct = default)
    {
        return _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId, ct);
    }

    public async Task<System.Collections.Generic.IReadOnlyList<Employee>> GetAllByCompanyIdAsync(int companyId, int? businessId = null, CancellationToken ct = default)
    {
        var query = _context.Employees.Where(e => e.CompanyId == companyId);
        if (businessId.HasValue)
        {
            query = query.Where(e => e.BusinessId == businessId.Value);
        }
        return await query.ToListAsync(ct);
    }

    public Task<Employee?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<Employee> AddAsync(Employee employee, CancellationToken ct = default)
    {
        employee.CreatedAt = System.DateTime.UtcNow;
        employee.UpdatedAt = System.DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(ct);
        return employee;
    }

    public async Task<Employee> UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        employee.UpdatedAt = System.DateTime.UtcNow;
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(ct);
        return employee;
    }
}
