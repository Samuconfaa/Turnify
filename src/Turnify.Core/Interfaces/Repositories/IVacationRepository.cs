using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IVacationRepository
{
    Task<VacationRequest?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<VacationRequest>> GetByCompanyAsync(int companyId, CancellationToken ct = default);
    Task<IReadOnlyList<VacationRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<VacationRequest> AddAsync(VacationRequest request, CancellationToken ct = default);
    Task<VacationRequest> UpdateAsync(VacationRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
