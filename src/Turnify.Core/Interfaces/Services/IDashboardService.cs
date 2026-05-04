using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardSummary> GetSummaryAsync(int companyId, DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<List<EmployeeHours>> GetHoursByEmployeeAsync(int companyId, DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<EmployeeDashboardSummary> GetEmployeeSummaryAsync(int employeeId, int companyId, CancellationToken ct = default);
}
