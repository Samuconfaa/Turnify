using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IShiftRepository
{
    Task<Shift?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> GetByCompanyAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> GetByEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<Shift> AddAsync(Shift shift, CancellationToken ct = default);
    Task<Shift> UpdateAsync(Shift shift, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<bool> HasOverlapAsync(int employeeId, DateTime start, DateTime end, int? excludeShiftId, CancellationToken ct = default);
}
