using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly TurnifyDbContext _context;

    public NotificationsController(TurnifyDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? isRead,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var userId = GetUserId();

        var query = _context.Notifications
            .Where(n => n.RecipientUserId == userId);

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        var total       = await query.CountAsync(ct);
        var unreadCount = await _context.Notifications
            .CountAsync(n => n.RecipientUserId == userId && !n.IsRead, ct);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                id         = n.Id,
                type       = n.Type.ToString(),
                title      = n.Title,
                body       = n.Body,
                isRead     = n.IsRead,
                readAt     = n.ReadAt,
                entityType = n.EntityType,
                entityId   = n.EntityId,
                createdAt  = n.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(new { data = items, total, unreadCount, page, pageSize });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        var userId = GetUserId();
        var n = await _context.Notifications
            .FirstOrDefaultAsync(x => x.Id == id && x.RecipientUserId == userId, ct);
        if (n == null) return NotFound();

        n.IsRead = true;
        n.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        var userId = GetUserId();
        var unread = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }
}
