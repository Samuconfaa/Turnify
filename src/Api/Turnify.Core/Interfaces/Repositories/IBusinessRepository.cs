using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Business>> GetAllByCompanyIdAsync(int companyId, CancellationToken ct = default);
    Task<Business> AddAsync(Business business, CancellationToken ct = default);
    Task<Business> UpdateAsync(Business business, CancellationToken ct = default);
}
