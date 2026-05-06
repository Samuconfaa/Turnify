using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IAppErrorLogRepository
{
    Task<AppErrorLog> AddAsync(AppErrorLog log, CancellationToken ct = default);
    Task<IReadOnlyList<AppErrorLog>> GetByCompanyAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<AppErrorLog>> GetAllAsync(DateTime from, DateTime to, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<AppErrorLog>> GetByUserAsync(int userId, CancellationToken ct = default);
}
