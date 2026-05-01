using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/vacation-balance")]
[Authorize]
public class VacationBalanceController : ControllerBase
{
    private readonly TurnifyDbContext _db;
    private readonly IEmployeeRepository _employeeRepository;

    public VacationBalanceController(TurnifyDbContext db, IEmployeeRepository employeeRepository)
    {
        _db = db;
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

    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    /// <summary>
    /// GET /api/vacation-balance/{employeeId}
    /// Admin/Manager: qualsiasi dipendente dell'azienda.
    /// Employee: solo se stesso (employeeId == proprio id).
    /// </summary>
    [HttpGet("{employeeId:int}")]
    public async Task<IActionResult> GetBalance(int employeeId, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var employee = await _employeeRepository.GetByIdAsync(employeeId, ct);
        if (employee == null || employee.CompanyId != companyId)
            return StatusCode(403);

        // Employee: solo se stesso
        if (!IsManagerOrAdmin())
        {
            var userId  = GetUserId();
            var me = await _employeeRepository.GetByUserIdAsync(userId, ct);
            if (me == null || me.Id != employeeId) return StatusCode(403);
        }

        var year  = DateTime.UtcNow.Year;
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var approved = await _db.VacationRequests
            .Where(v => v.EmployeeId == employeeId
                     && v.Status == VacationRequestStatus.Approved
                     && v.StartDate >= start && v.StartDate <= end)
            .ToListAsync(ct);

        int holidayUsed  = approved.Where(v => v.Type == VacationRequestType.Holiday)
                                   .Sum(v => v.TotalDays);
        int paidLeaveUsed = approved.Where(v => v.Type == VacationRequestType.PaidLeave)
                                    .Sum(v => v.TotalDays);
        int sickUsed     = approved.Where(v => v.Type == VacationRequestType.SickLeave)
                                   .Sum(v => v.TotalDays);
        int unpaidUsed   = approved.Where(v => v.Type == VacationRequestType.UnpaidLeave)
                                   .Sum(v => v.TotalDays);

        int holidayTotal   = employee.VacationDaysAllowed;
        int paidLeaveTotal = employee.PaidLeaveDaysPerYear;

        return Ok(new
        {
            holiday = new
            {
                total     = holidayTotal,
                used      = holidayUsed,
                remaining = Math.Max(0, holidayTotal - holidayUsed)
            },
            paidLeave = new
            {
                total     = paidLeaveTotal,
                used      = paidLeaveUsed,
                remaining = Math.Max(0, paidLeaveTotal - paidLeaveUsed)
            },
            sickLeave = new
            {
                total     = 0,
                used      = sickUsed,
                remaining = 0
            },
            unpaidLeave = new
            {
                total     = 0,
                used      = unpaidUsed,
                remaining = 0
            }
        });
    }

    /// <summary>
    /// GET /api/vacation-balance/me
    /// Scorciatoia per il dipendente che vuole vedere il proprio saldo.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyBalance(CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var userId   = GetUserId();
        var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
        if (employee == null) return NotFound();

        return await GetBalance(employee.Id, ct);
    }
}
