using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly TurnifyDbContext _context;

    public DashboardService(TurnifyDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummary> GetSummaryAsync(int companyId, DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var start = from ?? DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek + (int)DayOfWeek.Monday);
        var end = to ?? start.AddDays(7);

        var totalEmployees = await _context.Employees
            .Where(e => e.CompanyId == companyId && e.IsActive)
            .CountAsync(ct);

        var weekShifts = await _context.Shifts
            .Where(s => s.CompanyId == companyId && s.StartTime >= start && s.StartTime < end)
            .ToListAsync(ct);

        var pendingVacations = await _context.VacationRequests
            .Where(v => v.CompanyId == companyId && v.Status == VacationRequestStatus.Pending)
            .CountAsync(ct);

        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);

        var shiftsTodayData = await _context.Shifts
            .Where(s => s.CompanyId == companyId && s.StartTime >= todayStart && s.StartTime < todayEnd)
            .Join(_context.Employees, s => s.EmployeeId, e => e.Id, (s, e) => new DashboardShift
            {
                Id = s.Id,
                EmployeeName = e.FirstName + " " + e.LastName,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Role = e.Role,
                Status = s.Status.ToString()
            })
            .ToListAsync(ct);

        var pendingRequestsData = await _context.VacationRequests
            .Where(v => v.CompanyId == companyId && v.Status == VacationRequestStatus.Pending)
            .Join(_context.Employees, v => v.EmployeeId, e => e.Id, (v, e) => new DashboardPendingVacation
            {
                Id = v.Id,
                EmployeeName = e.FirstName + " " + e.LastName,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                Type = v.Type.ToString()
            })
            .ToListAsync(ct);

        decimal totalHours = 0;
        foreach (var shift in weekShifts)
        {
            totalHours += (decimal)(shift.EndTime - shift.StartTime).TotalHours;
        }

        return new DashboardSummary
        {
            TotalEmployees = totalEmployees,
            ShiftsThisWeek = weekShifts.Count,
            PendingVacations = pendingVacations,
            TotalHoursScheduled = totalHours,
            ShiftsToday = shiftsTodayData,
            PendingRequests = pendingRequestsData
        };
    }

    public async Task<List<EmployeeHours>> GetHoursByEmployeeAsync(int companyId, DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var start = from ?? DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek + (int)DayOfWeek.Monday);
        var end = to ?? start.AddDays(7);

        var shifts = await _context.Shifts
            .Where(s => s.CompanyId == companyId && s.StartTime >= start && s.StartTime < end)
            .Join(_context.Employees, s => s.EmployeeId, e => e.Id, (s, e) => new { s, e })
            .ToListAsync(ct);

        var result = shifts.GroupBy(x => new { x.e.Id, x.e.FirstName, x.e.LastName })
            .Select(g => new EmployeeHours
            {
                EmployeeId = g.Key.Id,
                EmployeeName = g.Key.FirstName + " " + g.Key.LastName,
                ShiftsCount = g.Count(),
                ScheduledHours = g.Sum(x => (decimal)(x.s.EndTime - x.s.StartTime).TotalHours)
            })
            .ToList();

        return result;
    }
}
