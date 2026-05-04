using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

public class CreateVacationRequestInput
{
    public int EmployeeId { get; set; }
    public string Type { get; set; } = "Holiday";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class UpdateVacationRequestInput
{
    public string Type { get; set; } = "Holiday";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}

public class ApproveRejectInput
{
    public string? Note { get; set; }
}

[ApiController]
[Route("api/vacation-requests")]
[Authorize]
public class VacationRequestsController : ControllerBase
{
    private readonly IVacationService _vacationService;
    private readonly IEmployeeRepository _employeeRepository;

    public VacationRequestsController(
        IVacationService vacationService,
        IEmployeeRepository employeeRepository)
    {
        _vacationService = vacationService;
        _employeeRepository = employeeRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId") ?? User.FindFirst("CompanyId");
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private bool IsAdmin() => User.IsInRole(UserRole.Admin.ToString());

    [HttpGet]
    public async Task<IActionResult> GetVacationRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var companyId = GetCompanyId();
        IReadOnlyList<VacationRequest> requests;

        if (IsAdmin())
            requests = await _vacationService.GetVacationRequestsAsync(companyId, ct);
        else
            requests = await _vacationService.GetVacationRequestsByEmployeeAsync(GetUserId(), ct);

        // Optional status filter
        if (!string.IsNullOrEmpty(status) &&
            Enum.TryParse<VacationRequestStatus>(status, true, out var statusEnum))
            requests = requests.Where(r => r.Status == statusEnum).ToList();

        // Load employee names for admin view
        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, null, ct);
        var nameMap   = employees.ToDictionary(e => e.Id, e => $"{e.FirstName} {e.LastName}".Trim());

        var paged = requests
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new
            {
                id             = v.Id,
                companyId      = v.CompanyId,
                employeeId     = v.EmployeeId,
                employeeName   = nameMap.TryGetValue(v.EmployeeId, out var n) ? n : string.Empty,
                type           = v.Type.ToString(),
                startDate      = v.StartDate,
                endDate        = v.EndDate,
                totalDays      = v.TotalDays,
                reason         = v.Reason,
                status         = v.Status.ToString(),
                reviewNote     = v.ReviewNote,
                reviewedAt     = v.ReviewedAt
            })
            .ToList();

        return Ok(paged);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVacationRequest(
        [FromBody] CreateVacationRequestInput input, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        if (input.EndDate < input.StartDate)
            return BadRequest(new { message = "La data di fine deve essere dopo la data di inizio." });

        if (!Enum.TryParse<VacationRequestType>(input.Type, ignoreCase: true, out var vacationType))
            vacationType = VacationRequestType.Holiday;

        var vr = new VacationRequest
        {
            CompanyId  = companyId,
            EmployeeId = input.EmployeeId,
            Type       = vacationType,
            StartDate  = input.StartDate,
            EndDate    = input.EndDate,
            TotalDays  = input.TotalDays > 0 ? input.TotalDays : 1,
            Reason     = input.Reason ?? string.Empty,
            Status     = VacationRequestStatus.Pending,
            CreatedAt  = DateTime.UtcNow,
            UpdatedAt  = DateTime.UtcNow
        };

        var created = await _vacationService.CreateVacationRequestAsync(vr, ct);
        return Created($"/api/vacation-requests/{created.Id}", created.Id);
    }

    // Admin can update any field (type, dates, status)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVacationRequest(
        int id, [FromBody] UpdateVacationRequestInput input, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403);

        if (!Enum.TryParse<VacationRequestType>(input.Type, ignoreCase: true, out var type))
            type = vr.Type;
        if (!Enum.TryParse<VacationRequestStatus>(input.Status, ignoreCase: true, out var statusEnum))
            statusEnum = vr.Status;

        vr.Type      = type;
        vr.StartDate = input.StartDate;
        vr.EndDate   = input.EndDate;
        vr.TotalDays = input.TotalDays > 0 ? input.TotalDays : vr.TotalDays;
        vr.Reason    = input.Reason ?? vr.Reason;
        vr.Status    = statusEnum;

        // If admin is approving/rejecting via PUT, record reviewer
        if (statusEnum == VacationRequestStatus.Approved ||
            statusEnum == VacationRequestStatus.Rejected)
        {
            vr.ReviewedByUserId = GetUserId();
            vr.ReviewedAt       = DateTime.UtcNow;
        }

        await _vacationService.UpdateVacationStatusAsync(id, vr, ct);
        return Ok(new { status = vr.Status.ToString() });
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(
        int id, [FromBody] ApproveRejectInput input, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403);

        var ok = await _vacationService.ApproveVacationRequestAsync(id, GetUserId(), input.Note, ct);
        return ok ? Ok(new { status = "Approved" }) : NotFound();
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(
        int id, [FromBody] ApproveRejectInput input, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403);

        var ok = await _vacationService.RejectVacationRequestAsync(id, GetUserId(), input.Note, ct);
        return ok ? Ok(new { status = "Rejected" }) : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        // Admin can delete any; employee can only delete their own pending
        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403);

        if (!IsAdmin() && vr.Status != VacationRequestStatus.Pending)
            return BadRequest(new { message = "Puoi annullare solo richieste in attesa." });

        var ok = await _vacationService.DeleteVacationRequestAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    // New endpoint: get approved vacations for a date range (used by calendar)
    [HttpGet("approved")]
    public async Task<IActionResult> GetApprovedVacations(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken ct = default)
    {
        var companyId = GetCompanyId();
        var requests  = await _vacationService.GetVacationRequestsAsync(companyId, ct);

        var approved = requests
            .Where(v => v.Status == VacationRequestStatus.Approved
                     && v.EndDate >= from && v.StartDate <= to)
            .ToList();

        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, null, ct);
        var nameMap   = employees.ToDictionary(e => e.Id, e => $"{e.FirstName} {e.LastName}".Trim());

        var result = approved.Select(v => new
        {
            employeeId   = v.EmployeeId,
            employeeName = nameMap.TryGetValue(v.EmployeeId, out var n) ? n : string.Empty,
            startDate    = v.StartDate,
            endDate      = v.EndDate,
            type         = v.Type.ToString()
        }).ToList();

        return Ok(result);
    }
}
