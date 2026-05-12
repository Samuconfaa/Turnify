using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Turnify.Mobile.Models;

public class VacationRequestDto
{
    [JsonPropertyName("id")]           public int Id { get; set; }
    [JsonPropertyName("employeeId")]   public int EmployeeId { get; set; }
    [JsonPropertyName("employeeName")] public string EmployeeName { get; set; } = string.Empty;
    [JsonPropertyName("type")]         public string Type { get; set; } = string.Empty;
    [JsonPropertyName("startDate")]    public DateTime StartDate { get; set; }
    [JsonPropertyName("endDate")]      public DateTime EndDate { get; set; }
    [JsonPropertyName("totalDays")]    public int TotalDays { get; set; }
    [JsonPropertyName("reason")]       public string Reason { get; set; } = string.Empty;
    [JsonPropertyName("status")]       public string Status { get; set; } = string.Empty;
    [JsonPropertyName("reviewNote")]   public string ReviewNote { get; set; } = string.Empty;
    [JsonPropertyName("reviewedAt")]   public DateTime? ReviewedAt { get; set; }

    public string StatusDisplay => Status switch
    {
        "Pending"   => "In Attesa",
        "Approved"  => "Approvata",
        "Rejected"  => "Rifiutata",
        "Cancelled" => "Annullata",
        _           => Status
    };
    public string TypeDisplay => Type switch
    {
        "Holiday"     => "Ferie",
        "PaidLeave"   => "Permesso retribuito",
        "UnpaidLeave" => "Permesso non retribuito",
        "SickLeave"   => "Malattia",
        _             => Type
    };
    public string DateRange    => $"{StartDate:dd MMM} – {EndDate:dd MMM yyyy}";
    public string StatusColor  => Status switch
    {
        "Approved" => "#16A34A", "Rejected" => "#DC2626",
        "Pending"  => "#D97706", _ => "#6B7280"
    };
    public string StatusBgColor => Status switch
    {
        "Approved" => "#E6F4EA", "Rejected" => "#FCE8E6",
        "Pending"  => "#FEF3C7", _ => "#F3F4F6"
    };
    public string StripColor => Status switch
    {
        "Approved" => "#16A34A", "Rejected" => "#BA1A1A",
        "Pending"  => "#F59E0B", _ => "#94A3B8"
    };
    public string TypeEmoji => Type switch
    {
        "Holiday"   => "🏖️",
        "SickLeave" => "🤒",
        _           => "⏱️"
    };
    public bool IsPending  => Status == "Pending";
    public bool IsApproved => Status == "Approved";
    public string Initials
    {
        get
        {
            if (string.IsNullOrWhiteSpace(EmployeeName)) return "?";
            var parts = EmployeeName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length >= 2
                ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
                : EmployeeName[0].ToString().ToUpper();
        }
    }
}

public class VacationPagedResponse
{
    [JsonPropertyName("data")]    public List<VacationRequestDto> Data    { get; set; } = new();
    [JsonPropertyName("total")]   public int Total   { get; set; }
    [JsonPropertyName("hasMore")] public bool HasMore { get; set; }
}
