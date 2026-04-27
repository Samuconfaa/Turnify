using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IDashboardService  _dashboardService;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository   _employeeRepository;

    public ReportsController(
        IDashboardService dashboardService,
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository)
    {
        _dashboardService     = dashboardService;
        _attendanceRepository = attendanceRepository;
        _employeeRepository   = employeeRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId") ?? User.FindFirst("CompanyId");
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    /// <summary>
    /// GET /api/reports/hours?from=&amp;to=
    /// Restituisce le ore pianificate per dipendente in formato CSV.
    /// </summary>
    [HttpGet("hours")]
    public async Task<IActionResult> GetHoursCsv(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return Forbid();

        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var start = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = to   ?? start.AddMonths(1);

        var data = await _dashboardService.GetHoursByEmployeeAsync(companyId, start, end, ct);

        var sb = new StringBuilder();
        sb.AppendLine("Dipendente,Turni,Ore Pianificate");
        foreach (var row in data.OrderByDescending(r => r.ScheduledHours))
            sb.AppendLine($"\"{row.EmployeeName}\",{row.ShiftsCount},{row.ScheduledHours:F1}");

        var fileName = $"ore-turni_{start:yyyy-MM-dd}_{end:yyyy-MM-dd}.csv";
        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv; charset=utf-8", fileName);
    }

    /// <summary>
    /// GET /api/reports/attendance?from=&amp;to=
    /// Restituisce il riepilogo presenze reali (da timbrature) in formato CSV.
    /// </summary>
    [HttpGet("attendance")]
    public async Task<IActionResult> GetAttendanceCsv(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return Forbid();

        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var start = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = to   ?? start.AddMonths(1);

        var logs      = await _attendanceRepository.GetByCompanyInRangeAsync(companyId, start, end, ct);
        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, null, ct);
        var nameMap   = employees.ToDictionary(e => e.Id, e => $"{e.FirstName} {e.LastName}".Trim());

        var grouped = logs
            .Where(l => l.CheckOutTime.HasValue)
            .GroupBy(l => l.EmployeeId)
            .Select(g => new
            {
                name  = nameMap.TryGetValue(g.Key, out var n) ? n : $"ID {g.Key}",
                days  = g.Select(l => l.CheckInTime.Date).Distinct().Count(),
                hours = Math.Round(g.Sum(l => (l.CheckOutTime!.Value - l.CheckInTime).TotalHours), 2)
            })
            .OrderByDescending(x => x.hours);

        var sb = new StringBuilder();
        sb.AppendLine("Dipendente,Giorni Lavorati,Ore Effettive");
        foreach (var row in grouped)
            sb.AppendLine($"\"{row.name}\",{row.days},{row.hours:F2}");

        var fileName = $"presenze_{start:yyyy-MM-dd}_{end:yyyy-MM-dd}.csv";
        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv; charset=utf-8", fileName);
    }
}
