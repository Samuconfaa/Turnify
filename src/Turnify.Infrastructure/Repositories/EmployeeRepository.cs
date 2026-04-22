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
}
