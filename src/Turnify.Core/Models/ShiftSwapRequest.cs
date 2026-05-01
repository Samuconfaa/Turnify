using System;

namespace Turnify.Core.Models;

public class ShiftSwapRequest
{
    public int Id { get; set; }
    public int RequestingEmployeeId { get; set; }
    public int RequestedEmployeeId { get; set; }
    public int ShiftAId { get; set; }
    public int ShiftBId { get; set; }
    public SwapStatus Status { get; set; } = SwapStatus.Pending;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
