using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IEmployeeRepository _employeeRepository;

    public DashboardController(IDashboardService dashboardService, IEmployeeRepository employeeRepository)
    {
        _dashboardService    = dashboardService;
        _employeeRepository  = employeeRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsAdmin() => User.IsInRole(UserRole.Admin.ToString());
    private bool IsManagerOrAdmin() =>
        User.IsInRole(UserRole.Admin.ToString()) || User.IsInRole(UserRole.Manager.ToString());

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    [HttpGet("employee-summary")]
    public async Task<IActionResult> GetEmployeeSummary(CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var userId   = GetUserId();
        var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);
        if (employee == null) return NotFound();

        var summary = await _dashboardService.GetEmployeeSummaryAsync(employee.Id, companyId, ct);

        return Ok(new
        {
            nextShift = summary.NextShift == null ? null : new
            {
                id        = summary.NextShift.Id,
                startTime = summary.NextShift.StartTime,
                endTime   = summary.NextShift.EndTime,
                label     = summary.NextShift.Label,
                note      = summary.NextShift.Note
            },
            vacationDaysUsedThisYear  = summary.VacationDaysUsedThisYear,
            vacationDaysAllowed       = employee.VacationDaysAllowed,
            pendingVacationRequests   = summary.PendingVacationRequests,
            isCheckedInToday          = summary.IsCheckedInToday,
            todayCheckIn              = summary.TodayCheckIn,
            todayCheckOut             = summary.TodayCheckOut,
            hoursWorkedThisMonth      = summary.HoursWorkedThisMonth,
            hoursScheduledThisWeek    = summary.HoursScheduledThisWeek
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return Forbid();

        var summary = await _dashboardService.GetSummaryAsync(GetCompanyId(), from, to, ct);

        var dto = new DashboardSummaryDto
        {
            TotalEmployees = summary.TotalEmployees,
            ShiftsThisWeek = summary.ShiftsThisWeek,
            PendingVacations = summary.PendingVacations,
            TotalHoursScheduled = summary.TotalHoursScheduled,
            ShiftsToday = summary.ShiftsToday.Select(s => new DashboardShiftDto
            {
                Id = s.Id,
                EmployeeName = s.EmployeeName,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Role = s.Role,
                Status = s.Status
            }).ToList(),
            PendingRequests = summary.PendingRequests.Select(v => new DashboardPendingVacationDto
            {
                Id = v.Id,
                EmployeeName = v.EmployeeName,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                Type = v.Type
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpGet("hours-by-employee")]
    public async Task<IActionResult> GetHoursByEmployee([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        if (!IsManagerOrAdmin()) return Forbid();

        var data = await _dashboardService.GetHoursByEmployeeAsync(GetCompanyId(), from, to, ct);

        var dtos = data.Select(d => new EmployeeHoursDto
        {
            EmployeeId = d.EmployeeId,
            EmployeeName = d.EmployeeName,
            ScheduledHours = d.ScheduledHours,
            ShiftsCount = d.ShiftsCount
        }).ToList();

        return Ok(dtos);
    }
}
