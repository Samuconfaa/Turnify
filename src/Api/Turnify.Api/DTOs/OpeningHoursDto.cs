using System.Collections.Generic;

namespace Turnify.Api.DTOs;

public class DayScheduleDto
{
    public bool IsOpen { get; set; }
    public string? Open { get; set; }
    public string? Close { get; set; }
}

public class OpeningHoursDto : Dictionary<string, DayScheduleDto>
{
}
