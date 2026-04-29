using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Repositories;

public class AppErrorLogRepository : IAppErrorLogRepository
{
    private readonly TurnifyDbContext _db;

    public AppErrorLogRepository(TurnifyDbContext db)
    {
        _db = db;
    }

    public async Task<AppErrorLog> AddAsync(AppErrorLog log, CancellationToken ct = default)
    {
        log.ReceivedAt = DateTime.UtcNow;
        _db.AppErrorLogs.Add(log);
        await _db.SaveChangesAsync(ct);
        return log;
    }

    public async Task<IReadOnlyList<AppErrorLog>> GetByCompanyAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default)
        => await _db.AppErrorLogs
            .Where(e => e.CompanyId == companyId && e.OccurredAt >= from && e.OccurredAt <= to)
            .OrderByDescending(e => e.OccurredAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<AppErrorLog>> GetAllAsync(DateTime from, DateTime to, int page, int pageSize, CancellationToken ct = default)
        => await _db.AppErrorLogs
            .Where(e => e.OccurredAt >= from && e.OccurredAt <= to)
            .OrderByDescending(e => e.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task<int> CountAsync(DateTime from, DateTime to, CancellationToken ct = default)
        => await _db.AppErrorLogs
            .CountAsync(e => e.OccurredAt >= from && e.OccurredAt <= to, ct);

    public async Task<IReadOnlyList<AppErrorLog>> GetByUserAsync(int userId, CancellationToken ct = default)
        => await _db.AppErrorLogs
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.OccurredAt)
            .Take(100)
            .ToListAsync(ct);
}
