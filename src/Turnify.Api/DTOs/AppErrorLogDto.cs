using System;
using System.ComponentModel.DataAnnotations;

namespace Turnify.Api.DTOs;

public class ReportErrorRequest
{
    [Required] public string DeviceId { get; set; } = string.Empty;
    [Required] public string Platform { get; set; } = string.Empty;
    [Required] public string AppVersion { get; set; } = string.Empty;
    [Required] public string ErrorType { get; set; } = string.Empty;
    [Required] public string Message { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string? ScreenName { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}

public class AppErrorLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? CompanyId { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public string ErrorType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string? ScreenName { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime ReceivedAt { get; set; }
}
