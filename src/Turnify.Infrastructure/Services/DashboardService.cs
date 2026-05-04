using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly TurnifyDbContext _context;
    private readonly IAttendanceRepository _attendanceRepository;

    public DashboardService(TurnifyDbContext context, IAttendanceRepository attendanceRepository)
    {
        _context              = context;
        _attendanceRepository = attendanceRepository;
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

    public async Task<EmployeeDashboardSummary> GetEmployeeSummaryAsync(
        int employeeId, int companyId, CancellationToken ct = default)
    {
        var now     = DateTime.UtcNow;
        var today   = now.Date;
        var weekEnd = today.AddDays(7);

        // Prossimo turno
        var nextShift = await _context.Shifts
            .Where(s => s.EmployeeId == employeeId && s.StartTime >= now && s.Status != ShiftStatus.Cancelled)
            .OrderBy(s => s.StartTime)
            .FirstOrDefaultAsync(ct);

        // Ferie usate quest'anno
        var yearStart = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var vacUsed = await _context.VacationRequests
            .Where(v => v.EmployeeId == employeeId &&
                        v.Status == VacationRequestStatus.Approved &&
                        v.StartDate >= yearStart)
            .SumAsync(v => (int?)v.TotalDays ?? 0, ct);

        var vacPending = await _context.VacationRequests
            .CountAsync(v => v.EmployeeId == employeeId && v.Status == VacationRequestStatus.Pending, ct);

        // Timbratura oggi
        var todayLog = await _attendanceRepository.GetTodayByEmployeeAsync(employeeId, ct);

        // Ore lavorate questo mese (da attendanceLogs)
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthLogs  = await _attendanceRepository.GetByEmployeeInRangeAsync(employeeId, monthStart, now, ct);
        var hoursMonth = monthLogs
            .Where(l => l.CheckOutTime.HasValue)
            .Sum(l => (decimal)(l.CheckOutTime!.Value - l.CheckInTime).TotalHours);

        // Ore schedulare questa settimana
        var weekShifts = await _context.Shifts
            .Where(s => s.EmployeeId == employeeId && s.StartTime >= today && s.StartTime < weekEnd)
            .ToListAsync(ct);
        var hoursWeek = weekShifts.Sum(s => (decimal)(s.EndTime - s.StartTime).TotalHours);

        return new EmployeeDashboardSummary
        {
            NextShift                = nextShift,
            VacationDaysUsedThisYear = vacUsed,
            PendingVacationRequests  = vacPending,
            IsCheckedInToday         = todayLog != null && todayLog.CheckOutTime == null,
            TodayCheckIn             = todayLog?.CheckInTime,
            TodayCheckOut            = todayLog?.CheckOutTime,
            HoursWorkedThisMonth     = Math.Round(hoursMonth, 1),
            HoursScheduledThisWeek   = Math.Round(hoursWeek, 1)
        };
    }
}
