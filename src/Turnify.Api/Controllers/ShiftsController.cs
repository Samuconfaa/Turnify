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
        var claim = User.FindFirst("companyId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsAdmin() => User.IsInRole(UserRole.Admin.ToString());

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ShiftDto>), 200)]
    public async Task<IActionResult> GetShifts(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int? employeeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var companyId = GetCompanyId();
        IReadOnlyList<Shift> shifts;

        if (IsAdmin())
        {
            // Admin: get all shifts for company, optionally filtered by employee
            shifts = await _shiftService.GetShiftsAsync(companyId, from, to, ct);
            if (employeeId.HasValue)
                shifts = shifts.Where(s => s.EmployeeId == employeeId.Value).ToList();
        }
        else
        {
            // Fix 2 & 6: Employee automatically sees only their own shifts — no way to see others
            var userId = GetUserId();
            var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
            if (employee == null) return Ok(new List<ShiftDto>()); // no employee profile yet

            shifts = await _shiftService.GetShiftsByEmployeeAsync(employee.Id, from, to, ct);

            // Extra safety: ensure these shifts actually belong to the employee's company
            shifts = shifts.Where(s => s.CompanyId == companyId).ToList();
        }

        var paged = shifts
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToDto)
            .ToList();

        // Return wrapped in object for mobile pagination support
        return Ok(new { data = paged, total = shifts.Count, page, pageSize });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ShiftDto), 201)]
    [ProducesResponseType(403)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> CreateShift([FromBody] CreateShiftRequest request, CancellationToken ct)
    {
        // Fix 6: Only admins can create shifts
        if (!IsAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono creare turni." });

        var companyId = GetCompanyId();

        // Verify employee belongs to this company
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, ct);
        if (employee == null || employee.CompanyId != companyId)
            return StatusCode(403, new { message = "Il dipendente non appartiene a questa azienda." });

        var shift = new Shift
        {
            CompanyId = companyId,
            EmployeeId = request.EmployeeId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Label = request.Label,
            Note = request.Note,
            Status = request.Status == default ? ShiftStatus.Scheduled : request.Status,
            IsRecurring = request.IsRecurring,
            RecurringGroupId = request.RecurringGroupId,
            CreatedByUserId = GetUserId()
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
    [ProducesResponseType(typeof(ShiftDto), 200)]
    public async Task<IActionResult> GetShift(int id, CancellationToken ct)
    {
        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        if (!IsAdmin())
        {
            // Employee can only see their own shift
            var userId = GetUserId();
            var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
            if (employee == null || shift.EmployeeId != employee.Id)
                return StatusCode(403, new { message = "Non hai accesso a questo turno." });
        }

        return Ok(MapToDto(shift));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ShiftDto), 200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> UpdateShift(int id, [FromBody] UpdateShiftRequest request, CancellationToken ct)
    {
        // Fix 6: Only admins can modify shifts
        if (!IsAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono modificare turni." });

        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        shift.StartTime = request.StartTime;
        shift.EndTime = request.EndTime;
        shift.Label = request.Label;
        shift.Note = request.Note;
        shift.Status = request.Status;
        shift.IsRecurring = request.IsRecurring;
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
    [ProducesResponseType(204)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> DeleteShift(int id, CancellationToken ct)
    {
        // Fix 6: Only admins can delete shifts
        if (!IsAdmin())
            return StatusCode(403, new { message = "Solo gli amministratori possono eliminare turni." });

        var shift = await _shiftService.GetShiftByIdAsync(id, ct);
        if (shift == null) return NotFound();
        if (shift.CompanyId != GetCompanyId()) return StatusCode(403);

        await _shiftService.DeleteShiftAsync(id, ct);
        return NoContent();
    }

    private static ShiftDto MapToDto(Shift s) => new()
    {
        Id = s.Id,
        CompanyId = s.CompanyId,
        EmployeeId = s.EmployeeId,
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        Label = s.Label,
        Note = s.Note,
        Status = s.Status,
        IsRecurring = s.IsRecurring,
        RecurringGroupId = s.RecurringGroupId
    };
}
