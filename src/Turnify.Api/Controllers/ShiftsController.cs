using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly IShiftService _shiftService;
    private readonly IEmployeeRepository _employeeRepository;

    public ShiftsController(IShiftService shiftService, IEmployeeRepository employeeRepository)
    {
        _shiftService = shiftService;
        _employeeRepository = employeeRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId")
                 ?? User.FindFirst("CompanyId");
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private bool IsAdmin() => User.IsInRole(UserRole.Admin.ToString());
    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    [HttpGet]
    public async Task<IActionResult> GetShifts(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int? employeeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        IReadOnlyList<Shift> shifts;

        if (IsAdmin())
        {
            shifts = await _shiftService.GetShiftsAsync(companyId, from, to, ct);
            if (employeeId.HasValue)
                shifts = shifts.Where(s => s.EmployeeId == employeeId.Value).ToList();
        }
        else
        {
            var userId   = GetUserId();
            var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
            if (employee == null) return Ok(new { data = new List<object>(), total = 0 });
            shifts = await _shiftService.GetShiftsByEmployeeAsync(employee.Id, from, to, ct);
            shifts = shifts.Where(s => s.CompanyId == companyId).ToList();
        }

        // Load all employees for the company once to build a name lookup
        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, null, ct);
        var nameMap   = employees.ToDictionary(e => e.Id, e => $"{e.FirstName} {e.LastName}".Trim());

        var paged = shifts
            .OrderBy(s => s.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                id               = s.Id,
                companyId        = s.CompanyId,
                employeeId       = s.EmployeeId,
                employeeName     = nameMap.TryGetValue(s.EmployeeId, out var n) ? n : string.Empty,
                startTime        = s.StartTime,
                endTime          = s.EndTime,
                label            = s.Label,
                note             = s.Note,
                status           = s.Status.ToString(),
                isRecurring      = s.IsRecurring,
                recurringGroupId = s.RecurringGroupId
            })
            .ToList();

        return Ok(new { data = paged, total = shifts.Count, page, pageSize });
    }

    [HttpPost("recurring")]
    public async Task<IActionResult> CreateRecurringShifts(
        [FromBody] CreateRecurringShiftsRequest request, CancellationToken ct)
    {
        if (!IsManagerOrAdmin())
            return StatusCode(403, new { message = "Solo admin e manager possono creare turni ricorrenti." });

        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        if (request.Weeks < 1 || request.Weeks > 52)
            return BadRequest(new { message = "Il numero di settimane deve essere compreso tra 1 e 52." });

        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, ct);
        if (employee == null || employee.CompanyId != companyId)
            return StatusCode(403, new { message = "Il dipendente non appartiene a questa azienda." });

        var baseShift = new Shift
        {
            CompanyId       = companyId,
            EmployeeId      = request.EmployeeId,
            StartTime       = request.StartTime,
            EndTime         = request.EndTime,
            Label           = request.Label ?? string.Empty,
            Note            = request.Note  ?? string.Empty,
            CreatedByUserId = GetUserId()
        };

        var created = await _shiftService.CreateRecurringShiftsAsync(baseShift, request.Weeks, ct);
        return Ok(new { created = created.Count, shifts = created.Select(MapToDto) });
    }

    [HttpGet("export.ics")]
    public async Task<IActionResult> ExportIcal(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var start = from ?? DateTime.UtcNow.Date;
        var end   = to   ?? start.AddDays(90);

        IReadOnlyList<Shift> shifts;
        if (IsManagerOrAdmin())
        {
            shifts = await _shiftService.GetShiftsAsync(companyId, start, end, ct);
        }
        else
        {
            var userId   = GetUserId();
            var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
            if (employee == null) return Ok();
            shifts = await _shiftService.GetShiftsByEmployeeAsync(employee.Id, start, end, ct);
        }

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("BEGIN:VCALENDAR");
        sb.AppendLine("VERSION:2.0");
        sb.AppendLine("PRODID:-//Turnify//Turnify//IT");
        sb.AppendLine("CALSCALE:GREGORIAN");
        sb.AppendLine("METHOD:PUBLISH");

        foreach (var s in shifts)
        {
            sb.AppendLine("BEGIN:VEVENT");
            sb.AppendLine($"UID:shift-{s.Id}@turnify.it");
            sb.AppendLine($"DTSTART:{s.StartTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"DTEND:{s.EndTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"SUMMARY:{(string.IsNullOrEmpty(s.Label) ? "Turno di lavoro" : s.Label)}");
            if (!string.IsNullOrEmpty(s.Note))
                sb.AppendLine($"DESCRIPTION:{s.Note}");
            sb.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
            sb.AppendLine("END:VEVENT");
        }

        sb.AppendLine("END:VCALENDAR");

        return File(
            System.Text.Encoding.UTF8.GetBytes(sb.ToString()),
            "text/calendar; charset=utf-8",
            "turni.ics");
    }

    [HttpPost]
    public async Task<IActionResult> CreateShift([FromBody] CreateShiftRequest request, CancellationToken ct)
    {
        if (!IsManagerOrAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono creare turni." });

        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, ct);
        if (employee == null || employee.CompanyId != companyId)
            return StatusCode(403, new { message = "Il dipendente non appartiene a questa azienda." });

        var shift = new Shift
        {
            CompanyId        = companyId,
            EmployeeId       = request.EmployeeId,
            StartTime        = request.StartTime,
            EndTime          = request.EndTime,
            Label            = request.Label ?? string.Empty,
            Note             = request.Note  ?? string.Empty,
            Status           = request.Status == default ? ShiftStatus.Scheduled : request.Status,
            IsRecurring      = request.IsRecurring,
            RecurringGroupId = request.RecurringGroupId,
            CreatedByUserId  = GetUserId()
        };

        try
        {
            var created = await _shiftService.CreateShiftAsync(shift, ct);
            return Created($"/api/shifts/{created.Id}", MapToDto(created));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Conflitto turni", Detail = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetShift(int id, CancellationToken ct)
    {
        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        if (!IsAdmin())
        {
            var emp = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
            if (emp == null || shift.EmployeeId != emp.Id)
                return StatusCode(403);
        }

        return Ok(MapToDto(shift));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShift(int id, [FromBody] UpdateShiftRequest request, CancellationToken ct)
    {
        if (!IsManagerOrAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono modificare turni." });

        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        shift.StartTime        = request.StartTime;
        shift.EndTime          = request.EndTime;
        shift.Label            = request.Label;
        shift.Note             = request.Note;
        shift.Status           = request.Status;
        shift.IsRecurring      = request.IsRecurring;
        shift.RecurringGroupId = request.RecurringGroupId;

        try
        {
            var updated = await _shiftService.UpdateShiftAsync(shift, ct);
            return Ok(MapToDto(updated));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Conflitto turni", Detail = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShift(int id, CancellationToken ct)
    {
        if (!IsManagerOrAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono eliminare turni." });

        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        await _shiftService.DeleteShiftAsync(id, ct);
        return NoContent();
    }

    private static ShiftDto MapToDto(Shift s) => new()
    {
        Id               = s.Id,
        CompanyId        = s.CompanyId,
        EmployeeId       = s.EmployeeId,
        StartTime        = s.StartTime,
        EndTime          = s.EndTime,
        Label            = s.Label,
        Note             = s.Note,
        Status           = s.Status,
        IsRecurring      = s.IsRecurring,
        RecurringGroupId = s.RecurringGroupId
    };
}
