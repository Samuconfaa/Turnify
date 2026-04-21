using System;

namespace Turnify.Core.Models;

public class VacationRequest
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int EmployeeId { get; set; }
    public VacationRequestType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public VacationRequestStatus Status { get; set; }
    public int? ReviewedByUserId { get; set; }
    public string ReviewNote { get; set; } = string.Empty;
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
