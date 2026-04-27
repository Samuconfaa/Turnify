using System;
using Turnify.Core.Models;

namespace Turnify.Api.DTOs;

public class UpdateShiftRequest
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public ShiftStatus Status { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurringGroupId { get; set; }
}
