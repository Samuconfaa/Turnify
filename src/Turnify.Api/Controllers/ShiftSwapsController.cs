using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/shift-swaps")]
[Authorize]
public class ShiftSwapsController : ControllerBase
{
    private readonly IShiftSwapRepository _swapRepo;
    private readonly IShiftRepository _shiftRepo;
    private readonly IEmployeeRepository _employeeRepo;
    private readonly IPushNotificationService _push;

    public ShiftSwapsController(
        IShiftSwapRepository swapRepo,
        IShiftRepository shiftRepo,
        IEmployeeRepository employeeRepo,
        IPushNotificationService push)
    {
        _swapRepo    = swapRepo;
        _shiftRepo   = shiftRepo;
        _employeeRepo = employeeRepo;
        _push        = push;
    }

    private int GetCompanyId()
    {
        var c = User.FindFirst("companyId") ?? User.FindFirst("CompanyId");
        return c != null && int.TryParse(c.Value, out int id) ? id : 0;
    }

    private int GetUserId()
    {
        var c = User.FindFirst(ClaimTypes.NameIdentifier)
             ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return c != null && int.TryParse(c.Value, out int id) ? id : 0;
    }

    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    // GET /api/shift-swaps
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        System.Collections.Generic.IReadOnlyList<ShiftSwapRequest> swaps;
        if (IsManagerOrAdmin())
        {
            swaps = await _swapRepo.GetByCompanyAsync(companyId, ct);
        }
        else
        {
            var userId = GetUserId();
            var me = await _employeeRepo.GetByUserIdAsync(userId, ct);
            if (me == null) return Ok(new object[0]);
            swaps = await _swapRepo.GetByEmployeeAsync(me.Id, ct);
        }

        return Ok(swaps.Select(s => MapDto(s)));
    }

    // POST /api/shift-swaps
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSwapInput input, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var userId = GetUserId();
        var me = await _employeeRepo.GetByUserIdAsync(userId, ct);
        if (me == null) return StatusCode(403);

        var shiftA = await _shiftRepo.GetByIdAsync(input.ShiftAId, ct);
        var shiftB = await _shiftRepo.GetByIdAsync(input.ShiftBId, ct);
        if (shiftA == null || shiftB == null) return BadRequest(new { message = "Turni non trovati." });
        if (shiftA.CompanyId != companyId || shiftB.CompanyId != companyId) return StatusCode(403);
        if (shiftA.EmployeeId != me.Id) return BadRequest(new { message = "Puoi proporre solo scambi del tuo turno." });

        var swap = new ShiftSwapRequest
        {
            RequestingEmployeeId = me.Id,
            RequestedEmployeeId  = input.RequestedEmployeeId,
            ShiftAId             = input.ShiftAId,
            ShiftBId             = input.ShiftBId,
            Note                 = input.Note,
            Status               = SwapStatus.Pending
        };

        await _swapRepo.AddAsync(swap, ct);

        // Push al collega
        var peer = await _employeeRepo.GetByIdAsync(input.RequestedEmployeeId, ct);
        if (peer?.UserId != null)
            _ = _push.SendToUserAsync(peer.UserId.Value,
                "Proposta di scambio turno",
                $"{me.FirstName} {me.LastName} ti ha proposto uno scambio di turno.", ct: ct);

        return Ok(MapDto(swap));
    }

    // PUT /api/shift-swaps/{id}/peer-accept
    [HttpPut("{id:int}/peer-accept")]
    public async Task<IActionResult> PeerAccept(int id, CancellationToken ct)
        => await PeerRespond(id, accept: true, ct);

    // PUT /api/shift-swaps/{id}/peer-reject
    [HttpPut("{id:int}/peer-reject")]
    public async Task<IActionResult> PeerReject(int id, CancellationToken ct)
        => await PeerRespond(id, accept: false, ct);

    private async Task<IActionResult> PeerRespond(int id, bool accept, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        var userId    = GetUserId();
        var me = await _employeeRepo.GetByUserIdAsync(userId, ct);
        if (me == null) return StatusCode(403);

        var swap = await _swapRepo.GetByIdAsync(id, ct);
        if (swap == null) return NotFound();
        if (swap.RequestedEmployeeId != me.Id) return StatusCode(403);
        if (swap.Status != SwapStatus.Pending)
            return BadRequest(new { message = "La proposta non è più in attesa." });

        swap.Status     = accept ? SwapStatus.AcceptedByPeer : SwapStatus.RejectedByPeer;
        swap.ResolvedAt = accept ? null : DateTime.UtcNow;
        await _swapRepo.UpdateAsync(swap, ct);

        // Push al richiedente
        var requester = await _employeeRepo.GetByIdAsync(swap.RequestingEmployeeId, ct);
        if (requester?.UserId != null)
        {
            var msg = accept ? "ha accettato la proposta di scambio" : "ha rifiutato la proposta di scambio";
            _ = _push.SendToUserAsync(requester.UserId.Value,
                "Risposta alla proposta di scambio",
                $"{me.FirstName} {me.LastName} {msg}. In attesa di approvazione admin.", ct: ct);
        }

        return Ok(MapDto(swap));
    }

    // PUT /api/shift-swaps/{id}/admin-approve
    [HttpPut("{id:int}/admin-approve")]
    public async Task<IActionResult> AdminApprove(int id, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return StatusCode(403);
        var swap = await _swapRepo.GetByIdAsync(id, ct);
        if (swap == null) return NotFound();
        if (swap.Status != SwapStatus.AcceptedByPeer)
            return BadRequest(new { message = "Lo scambio non è stato ancora accettato dal collega." });

        var shiftA = await _shiftRepo.GetByIdAsync(swap.ShiftAId, ct);
        var shiftB = await _shiftRepo.GetByIdAsync(swap.ShiftBId, ct);
        if (shiftA == null || shiftB == null) return BadRequest(new { message = "Turni non trovati." });

        // Scambia gli EmployeeId tra i due turni
        (shiftA.EmployeeId, shiftB.EmployeeId) = (shiftB.EmployeeId, shiftA.EmployeeId);
        await _shiftRepo.UpdateAsync(shiftA, ct);
        await _shiftRepo.UpdateAsync(shiftB, ct);

        swap.Status     = SwapStatus.Executed;
        swap.ResolvedAt = DateTime.UtcNow;
        await _swapRepo.UpdateAsync(swap, ct);

        // Push a entrambi
        var empA = await _employeeRepo.GetByIdAsync(swap.RequestingEmployeeId, ct);
        var empB = await _employeeRepo.GetByIdAsync(swap.RequestedEmployeeId,  ct);
        if (empA?.UserId != null)
            _ = _push.SendToUserAsync(empA.UserId.Value, "Scambio turno approvato",
                "Il tuo scambio di turno è stato approvato ed eseguito.", ct: ct);
        if (empB?.UserId != null)
            _ = _push.SendToUserAsync(empB.UserId.Value, "Scambio turno approvato",
                "Lo scambio di turno è stato approvato ed eseguito.", ct: ct);

        return Ok(MapDto(swap));
    }

    // PUT /api/shift-swaps/{id}/admin-reject
    [HttpPut("{id:int}/admin-reject")]
    public async Task<IActionResult> AdminReject(int id, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return StatusCode(403);
        var swap = await _swapRepo.GetByIdAsync(id, ct);
        if (swap == null) return NotFound();

        swap.Status     = SwapStatus.RejectedByAdmin;
        swap.ResolvedAt = DateTime.UtcNow;
        await _swapRepo.UpdateAsync(swap, ct);

        var empA = await _employeeRepo.GetByIdAsync(swap.RequestingEmployeeId, ct);
        if (empA?.UserId != null)
            _ = _push.SendToUserAsync(empA.UserId.Value, "Scambio turno rifiutato",
                "L'admin ha rifiutato la proposta di scambio.", ct: ct);

        return Ok(MapDto(swap));
    }

    private static object MapDto(ShiftSwapRequest s) => new
    {
        s.Id,
        s.RequestingEmployeeId,
        s.RequestedEmployeeId,
        s.ShiftAId,
        s.ShiftBId,
        status     = s.Status.ToString(),
        s.Note,
        s.CreatedAt,
        s.ResolvedAt
    };

    public record CreateSwapInput(int RequestedEmployeeId, int ShiftAId, int ShiftBId, string? Note);
}
