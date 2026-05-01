using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/invites")]
[Authorize]
public class InviteController : ControllerBase
{
    private readonly IInviteRepository _inviteRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;

    public InviteController(
        IInviteRepository inviteRepository,
        IEmployeeRepository employeeRepository,
        IUserRepository userRepository)
    {
        _inviteRepository = inviteRepository;
        _employeeRepository = employeeRepository;
        _userRepository = userRepository;
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

    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    /// <summary>GET /api/invites — lista codici attivi (admin/manager)</summary>
    [HttpGet]
    public async Task<IActionResult> GetActive(CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return StatusCode(403);
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var invites = await _inviteRepository.GetActiveByCompanyAsync(companyId, ct);
        return Ok(invites.Select(i => new
        {
            i.Id,
            i.Code,
            i.ExpiresAt,
            i.IsUsed,
            i.CreatedAt
        }));
    }

    /// <summary>POST /api/invites — genera un nuovo codice (admin/manager)</summary>
    [HttpPost]
    public async Task<IActionResult> Generate(CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return StatusCode(403);
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var code = GenerateCode();
        var invite = new Invite
        {
            Code             = code,
            CompanyId        = companyId,
            CreatedByUserId  = GetUserId(),
            ExpiresAt        = DateTime.UtcNow.AddDays(7),
            IsUsed           = false
        };

        await _inviteRepository.AddAsync(invite, ct);
        return Ok(new { invite.Id, invite.Code, invite.ExpiresAt });
    }

    /// <summary>DELETE /api/invites/{id} — revoca un codice (admin/manager)</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Revoke(int id, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return StatusCode(403);
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var invite = await _inviteRepository.GetByIdAsync(id, ct);
        if (invite == null) return NotFound();
        if (invite.CompanyId != companyId) return StatusCode(403);

        await _inviteRepository.DeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>
    /// POST /api/invites/redeem — il dipendente usa il codice per associarsi all'azienda.
    /// Crea un record Employee collegato all'utente corrente.
    /// </summary>
    [HttpPost("redeem")]
    public async Task<IActionResult> Redeem([FromBody] RedeemInput input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Code))
            return BadRequest(new { message = "Codice obbligatorio." });

        var code = input.Code.Trim().ToUpperInvariant();
        var invite = await _inviteRepository.GetByCodeAsync(code, ct);

        if (invite == null || invite.IsUsed || invite.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Codice non valido o scaduto." });

        var userId = GetUserId();
        var user   = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return Unauthorized();

        // Controlla che l'utente non sia già associato all'azienda
        var existing = await _employeeRepository.GetByUserIdAsync(userId, ct);
        if (existing != null && existing.CompanyId == invite.CompanyId)
            return BadRequest(new { message = "Sei già associato a questa azienda." });

        var employee = new Employee
        {
            CompanyId   = invite.CompanyId,
            UserId      = userId,
            FirstName   = user.FirstName ?? string.Empty,
            LastName    = user.LastName  ?? string.Empty,
            Email       = user.Email     ?? string.Empty,
            IsActive    = true,
            HireDate    = DateTime.UtcNow
        };

        await _employeeRepository.AddAsync(employee, ct);

        invite.IsUsed      = true;
        invite.UsedByUserId = userId;
        await _inviteRepository.UpdateAsync(invite, ct);

        // Aggiorna il CompanyId dell'utente se non ce l'ha già
        if (user.CompanyId == 0)
        {
            user.CompanyId = invite.CompanyId;
            await _userRepository.UpdateAsync(user, ct);
        }

        return Ok(new { message = "Associazione completata con successo." });
    }

    private static string GenerateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var rng  = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[8];
        rng.GetBytes(bytes);
        var code = new System.Text.StringBuilder("TURN-");
        foreach (var b in bytes.Take(4))
            code.Append(chars[b % chars.Length]);
        return code.ToString();
    }

    public record RedeemInput(string Code);
}
