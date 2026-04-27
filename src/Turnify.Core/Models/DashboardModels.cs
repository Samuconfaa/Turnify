using System;
using System.Collections.Generic;

namespace Turnify.Core.Models;

public class DashboardSummary
{
    public int TotalEmployees { get; set; }
    public int ShiftsThisWeek { get; set; }
    public int PendingVacations { get; set; }
    public decimal TotalHoursScheduled { get; set; }
    
    public List<DashboardShift> ShiftsToday { get; set; } = new();
    public List<DashboardPendingVacation> PendingRequests { get; set; } = new();
}

public class DashboardShift
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class DashboardPendingVacation
{
    public int Id { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class EmployeeHours
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal ScheduledHours { get; set; }
    public int ShiftsCount { get; set; }
}

public class EmployeeDashboardSummary
{
    public Shift? NextShift { get; set; }
    public int VacationDaysUsedThisYear { get; set; }
    public int PendingVacationRequests { get; set; }
    public bool IsCheckedInToday { get; set; }
    public DateTime? TodayCheckIn { get; set; }
    public DateTime? TodayCheckOut { get; set; }
    public decimal HoursWorkedThisMonth { get; set; }
    public decimal HoursScheduledThisWeek { get; set; }
}
