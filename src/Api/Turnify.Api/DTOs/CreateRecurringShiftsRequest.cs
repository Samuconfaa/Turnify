using System;

namespace Turnify.Api.DTOs;

public class CreateRecurringShiftsRequest
{
    public int EmployeeId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public int Weeks { get; set; } = 4;
}
