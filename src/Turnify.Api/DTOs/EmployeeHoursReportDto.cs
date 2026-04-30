using System.Collections.Generic;

namespace Turnify.Api.DTOs;

public class EmployeeHoursReportDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public double TotalHours { get; set; }
    public List<HoursBreakdownDto> Breakdown { get; set; } = new();
}

public class HoursBreakdownDto
{
    public string Period { get; set; } = string.Empty;
    public double Hours { get; set; }
}
