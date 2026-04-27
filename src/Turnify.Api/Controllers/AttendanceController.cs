using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
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
}
