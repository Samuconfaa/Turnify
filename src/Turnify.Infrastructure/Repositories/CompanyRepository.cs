using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class CompanyRepository : ICompanyRepository
{
    private readonly TurnifyDbContext _context;

    public CompanyRepository(TurnifyDbContext context)
    {
        _context = context;
    }

    public Task<Company?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _context.Companies.FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public Task<bool> ExistsBySlugAsync(string slug, CancellationToken ct = default)
    {
        return _context.Companies.AnyAsync(c => c.Slug == slug, ct);
    }

    public async Task<Company> AddAsync(Company company, CancellationToken ct = default)
    {
        _context.Companies.Add(company);
        await _context.SaveChangesAsync(ct);
        return company;
    }
}
