using System;
using System.Collections.Generic;

namespace Turnify.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalEmployees { get; set; }
    public int ShiftsThisWeek { get; set; }
    public int PendingVacations { get; set; }
    public decimal TotalHoursScheduled { get; set; }
    
    public List<DashboardShiftDto> ShiftsToday { get; set; } = new();
    public List<DashboardPendingVacationDto> PendingRequests { get; set; } = new();
}

public class DashboardShiftDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class DashboardPendingVacationDto
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class EmployeeHoursDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal ScheduledHours { get; set; }
    public int ShiftsCount { get; set; }
}
