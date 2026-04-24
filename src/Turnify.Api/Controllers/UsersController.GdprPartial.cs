using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Turnify.Api.Controllers;

/// <summary>
/// Endpoint aggiuntivi sul profilo utente: esportazione dati e cancellazione account (GDPR).
/// </summary>
public partial class UsersController
{
    // Nota: questo file è una partial class di UsersController.
    // In produzione unire questi metodi nel file UsersController.cs principale.

    /// <summary>
    /// Segna l'account per cancellazione (GDPR Art. 17 — Right to erasure).
    /// La cancellazione effettiva avviene entro 30 giorni tramite un job schedulato.
    /// </summary>
    [HttpPost("me/request-deletion")]
    [Authorize]
    public async Task<IActionResult> RequestDeletion(CancellationToken ct)
    {
        var userId = GetUserId();
        var user   = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        // Disattiva immediatamente l'account e marca per cancellazione
        user.IsActive  = false;
        user.UpdatedAt = DateTime.UtcNow;

        // In produzione: aggiungere campo DeletionRequestedAt e DeletionScheduledAt
        // e inviare email di conferma tramite un servizio email (es. SendGrid)
        await _userRepository.UpdateAsync(user, ct);

        return NoContent(); // 204
    }

    /// <summary>
    /// Esporta tutti i dati personali dell'utente in formato JSON (GDPR Art. 20 — Portabilità).
    /// </summary>
    [HttpGet("me/export-data")]
    [Authorize]
    public async Task<IActionResult> ExportData(CancellationToken ct)
    {
        var userId = GetUserId();
        var user   = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);

        // Raccoglie tutti i dati associati all'utente
        var exportData = new
        {
            exportDate    = DateTime.UtcNow,
            gdprReference = "GDPR Art. 20 - Diritto alla portabilità dei dati",
            user = new
            {
                id           = user.Id,
                email        = user.Email,
                role         = user.Role.ToString(),
                createdAt    = user.CreatedAt,
                lastLoginAt  = user.LastLoginAt
            },
            employee = employee == null ? null : new
            {
                id           = employee.Id,
                firstName    = employee.FirstName,
                lastName     = employee.LastName,
                email        = employee.Email,
                phone        = employee.Phone,
                role         = employee.Role,
                contractType = employee.ContractType.ToString(),
                weeklyHours  = employee.WeeklyHours,
                hireDate     = employee.HireDate
            }
        };

        return new JsonResult(exportData)
        {
            StatusCode   = 200,
            ContentType  = "application/json"
        };
    }
}
