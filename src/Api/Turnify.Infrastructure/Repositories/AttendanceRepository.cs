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

public class AttendanceRepository : IAttendanceRepository
{
    private readonly TurnifyDbContext _db;

    public AttendanceRepository(TurnifyDbContext db) => _db = db;

    public Task<AttendanceLog?> GetTodayByEmployeeAsync(int employeeId, CancellationToken ct = default)
    {
        var todayUtc = DateTime.UtcNow.Date;
        return _db.AttendanceLogs
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId &&
                a.CheckInTime >= todayUtc &&
                a.CheckInTime < todayUtc.AddDays(1), ct);
    }

    public async Task<IReadOnlyList<AttendanceLog>> GetByEmployeeInRangeAsync(
        int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _db.AttendanceLogs
            .Where(a => a.EmployeeId == employeeId && a.CheckInTime >= from && a.CheckInTime < to)
            .OrderByDescending(a => a.CheckInTime)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AttendanceLog>> GetByCompanyInRangeAsync(
        int companyId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _db.AttendanceLogs
            .Where(a => a.CompanyId == companyId && a.CheckInTime >= from && a.CheckInTime < to)
            .OrderByDescending(a => a.CheckInTime)
            .ToListAsync(ct);
    }

    public async Task<AttendanceLog> AddAsync(AttendanceLog log, CancellationToken ct = default)
    {
        _db.AttendanceLogs.Add(log);
        await _db.SaveChangesAsync(ct);
        return log;
    }

    public async Task<AttendanceLog> UpdateAsync(AttendanceLog log, CancellationToken ct = default)
    {
        _db.AttendanceLogs.Update(log);
        await _db.SaveChangesAsync(ct);
        return log;
    }
}
