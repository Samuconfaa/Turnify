using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IInviteRepository
{
    Task<Invite> AddAsync(Invite invite, CancellationToken ct = default);
    Task<Invite?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<IReadOnlyList<Invite>> GetActiveByCompanyAsync(int companyId, CancellationToken ct = default);
    Task<Invite?> GetByIdAsync(int id, CancellationToken ct = default);
    Task UpdateAsync(Invite invite, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
