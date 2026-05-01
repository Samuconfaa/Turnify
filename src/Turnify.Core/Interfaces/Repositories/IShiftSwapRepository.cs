using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IShiftSwapRepository
{
    Task<ShiftSwapRequest> AddAsync(ShiftSwapRequest swap, CancellationToken ct = default);
    Task<ShiftSwapRequest?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<ShiftSwapRequest>> GetByCompanyAsync(int companyId, CancellationToken ct = default);
    Task<IReadOnlyList<ShiftSwapRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task UpdateAsync(ShiftSwapRequest swap, CancellationToken ct = default);
}
