using System;

namespace Turnify.Core.Models;

public class Shift
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public ShiftStatus Status { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurringGroupId { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
