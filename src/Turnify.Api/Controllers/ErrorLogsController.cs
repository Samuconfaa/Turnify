using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErrorLogsController : ControllerBase
{
    private readonly IAppErrorLogRepository _repo;
    private readonly string _ownerEmail;

    public ErrorLogsController(IAppErrorLogRepository repo, IConfiguration config)
    {
        _repo       = repo;
        _ownerEmail = config["Platform:OwnerEmail"] ?? string.Empty;
    }

    // Chiunque autenticato può inviare un errore
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Report([FromBody] ReportErrorRequest request, CancellationToken ct)
    {
        var userIdStr    = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var companyIdStr = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

        var log = new AppErrorLog
        {
            UserId      = int.TryParse(userIdStr,    out var uid) ? uid : null,
            CompanyId   = int.TryParse(companyIdStr, out var cid) ? cid : null,
            DeviceId    = request.DeviceId,
            Platform    = request.Platform,
            AppVersion  = request.AppVersion,
            ErrorType   = request.ErrorType,
            Message     = request.Message,
            StackTrace  = request.StackTrace,
            ScreenName  = request.ScreenName,
            OccurredAt  = request.OccurredAt == default ? DateTime.UtcNow : request.OccurredAt
        };

        await _repo.AddAsync(log, ct);
        return Ok();
    }

    // Solo il platform owner (la tua email) può leggere tutti gli errori
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetLogs(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var callerEmail = User.FindFirst(ClaimTypes.Email)?.Value
                       ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
                       ?? string.Empty;

        if (string.IsNullOrEmpty(_ownerEmail) || !callerEmail.Equals(_ownerEmail, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var start    = from ?? DateTime.UtcNow.AddDays(-7);
        var end      = to   ?? DateTime.UtcNow;
        pageSize     = Math.Clamp(pageSize, 1, 200);

        var total = await _repo.CountAsync(start, end, ct);
        var logs  = await _repo.GetAllAsync(start, end, page, pageSize, ct);

        var result = logs.Select(l => new AppErrorLogDto
        {
            Id         = l.Id,
            UserId     = l.UserId,
            CompanyId  = l.CompanyId,
            DeviceId   = l.DeviceId,
            Platform   = l.Platform,
            AppVersion = l.AppVersion,
            ErrorType  = l.ErrorType,
            Message    = l.Message,
            StackTrace = l.StackTrace,
            ScreenName = l.ScreenName,
            OccurredAt = l.OccurredAt,
            ReceivedAt = l.ReceivedAt
        });

        return Ok(new { data = result, total, page, pageSize });
    }
}
