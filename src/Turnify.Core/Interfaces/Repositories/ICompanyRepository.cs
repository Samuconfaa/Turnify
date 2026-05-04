using System;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface ICompanyRepository
{
    Task<Company?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken ct = default);
    Task<Company> AddAsync(Company company, CancellationToken ct = default);
}
