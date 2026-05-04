using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/vacation-requests")]
[Authorize]
public class VacationRequestsController : ControllerBase
{
    private readonly IVacationService _vacationService;

    public VacationRequestsController(IVacationService vacationService)
    {
        _vacationService = vacationService;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsAdmin()
    {
        return User.IsInRole(UserRole.Admin.ToString());
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VacationRequestDto>), 200)]
    public async Task<IActionResult> GetVacationRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var companyId = GetCompanyId();
        
        IReadOnlyList<VacationRequest> requests;
        
        if (IsAdmin())
        {
            requests = await _vacationService.GetVacationRequestsAsync(companyId, ct);
        }
        else
        {
            requests = await _vacationService.GetVacationRequestsByEmployeeAsync(GetUserId(), ct);
            if (requests.Any(r => r.CompanyId != companyId))
            {
                return StatusCode(403, "Accesso negato: risorsa di un'altra azienda.");
            }
        }

        var paged = requests.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto).ToList();
        return Ok(paged);
    }

    [HttpPost]
    [ProducesResponseType(typeof(VacationRequestDto), 200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> CreateVacationRequest([FromBody] CreateVacationRequest request, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        
        var vr = new VacationRequest
        {
            CompanyId = companyId,
            EmployeeId = request.EmployeeId,
            Type = request.Type,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalDays = request.TotalDays,
            Reason = request.Reason
        };

        var created = await _vacationService.CreateVacationRequestAsync(vr, ct);
        return Ok(MapToDto(created));
    }

    [HttpPut("{id}/approve")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ApproveVacationRequest(int id, [FromBody] ApproveRejectRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403, "Accesso negato.");

        var success = await _vacationService.ApproveVacationRequestAsync(id, GetUserId(), request.Note, ct);
        if (!success) return NotFound();

        return Ok();
    }

    [HttpPut("{id}/reject")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RejectVacationRequest(int id, [FromBody] ApproveRejectRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403, "Accesso negato.");

        var success = await _vacationService.RejectVacationRequestAsync(id, GetUserId(), request.Note, ct);
        if (!success) return NotFound();

        return Ok();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteVacationRequest(int id, CancellationToken ct)
    {
        var vr = await _vacationService.GetVacationRequestByIdAsync(id, ct);
        if (vr == null) return NotFound();
        if (vr.CompanyId != GetCompanyId()) return StatusCode(403, "Accesso negato.");

        var success = await _vacationService.DeleteVacationRequestAsync(id, ct);
        if (!success) return NotFound();

        return Ok();
    }

    private static VacationRequestDto MapToDto(VacationRequest v)
    {
        return new VacationRequestDto
        {
            Id = v.Id,
            CompanyId = v.CompanyId,
            EmployeeId = v.EmployeeId,
            Type = v.Type,
            StartDate = v.StartDate,
            EndDate = v.EndDate,
            TotalDays = v.TotalDays,
            Reason = v.Reason,
            Status = v.Status,
            ReviewNote = v.ReviewNote,
            ReviewedAt = v.ReviewedAt
        };
    }
}
