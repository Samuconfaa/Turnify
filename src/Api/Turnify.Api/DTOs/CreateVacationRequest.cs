using System;
using Turnify.Core.Models;

namespace Turnify.Api.DTOs;

public class CreateVacationRequest
{
    public int EmployeeId { get; set; }
    public VacationRequestType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
}
