using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

public class CheckInRequest
{
    public int? ShiftId { get; set; }
}

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IEmployeeRepository   _employeeRepository;

    public AttendanceController(
        IAttendanceRepository attendanceRepository,
        IEmployeeRepository employeeRepository)
    {
        _attendanceRepository = attendanceRepository;
        _employeeRepository   = employeeRepository;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId") ?? User.FindFirst("CompanyId");
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday(CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return NotFound();

        var log = await _attendanceRepository.GetTodayByEmployeeAsync(employee.Id, ct);
        if (log == null) return Ok(new { isCheckedIn = false, checkInTime = (DateTime?)null, checkOutTime = (DateTime?)null });

        return Ok(new
        {
            isCheckedIn  = log.CheckOutTime == null,
            checkInTime  = log.CheckInTime,
            checkOutTime = log.CheckOutTime
        });
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return Forbid();

        var existing = await _attendanceRepository.GetTodayByEmployeeAsync(employee.Id, ct);
        if (existing != null && existing.CheckOutTime == null)
            return Conflict(new { message = "Sei già entrato oggi." });

        var log = new AttendanceLog
        {
            CompanyId       = GetCompanyId(),
            EmployeeId      = employee.Id,
            ShiftId         = request.ShiftId,
            CheckInTime     = DateTime.UtcNow,
            CheckInMethod   = CheckInMethod.App,
            CreatedAt       = DateTime.UtcNow
        };

        await _attendanceRepository.AddAsync(log, ct);
        return Ok(new { checkInTime = log.CheckInTime });
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckOut(CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return Forbid();

        var log = await _attendanceRepository.GetTodayByEmployeeAsync(employee.Id, ct);
        if (log == null || log.CheckOutTime != null)
            return Conflict(new { message = "Nessuna entrata attiva da chiudere." });

        log.CheckOutTime = DateTime.UtcNow;
        await _attendanceRepository.UpdateAsync(log, ct);

        return Ok(new { checkOutTime = log.CheckOutTime });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken ct = default)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return NotFound();

        var start = from ?? DateTime.UtcNow.AddDays(-30);
        var end   = to   ?? DateTime.UtcNow.AddDays(1);

        var logs = await _attendanceRepository.GetByEmployeeInRangeAsync(employee.Id, start, end, ct);

        var paged = logs
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                id            = l.Id,
                checkInTime   = l.CheckInTime,
                checkOutTime  = l.CheckOutTime,
                checkInMethod = l.CheckInMethod.ToString(),
                hoursWorked   = l.CheckOutTime.HasValue
                    ? Math.Round((l.CheckOutTime.Value - l.CheckInTime).TotalHours, 2)
                    : (double?)null,
                notes         = l.Notes
            })
            .ToList();

        return Ok(new { data = paged, total = logs.Count, page, pageSize });
    }

    [HttpGet("monthly-summary")]
    public async Task<IActionResult> GetMonthlySummary(
        [FromQuery] int? year, [FromQuery] int? month, CancellationToken ct = default)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return NotFound();

        var y = year  ?? DateTime.UtcNow.Year;
        var m = month ?? DateTime.UtcNow.Month;

        var from = new DateTime(y, m, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = from.AddMonths(1);

        var logs = await _attendanceRepository.GetByEmployeeInRangeAsync(employee.Id, from, to, ct);

        var completedLogs = logs.Where(l => l.CheckOutTime.HasValue).ToList();
        var totalHours    = completedLogs.Sum(l => (l.CheckOutTime!.Value - l.CheckInTime).TotalHours);
        var daysWorked    = completedLogs.Select(l => l.CheckInTime.Date).Distinct().Count();

        var byDay = completedLogs
            .GroupBy(l => l.CheckInTime.Date)
            .Select(g => new
            {
                date        = g.Key,
                hoursWorked = Math.Round(g.Sum(l => (l.CheckOutTime!.Value - l.CheckInTime).TotalHours), 2),
                sessions    = g.Count()
            })
            .OrderBy(x => x.date)
            .ToList();

        return Ok(new
        {
            year       = y,
            month      = m,
            daysWorked,
            totalHours = Math.Round(totalHours, 2),
            byDay
        });
    }
}
