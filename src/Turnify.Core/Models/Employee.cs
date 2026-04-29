using System;

namespace Turnify.Core.Models;

public class Employee
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public ContractType ContractType { get; set; }
    public decimal WeeklyHours { get; set; }
    public DateTime HireDate { get; set; }
    public bool IsActive { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string AvailableDays { get; set; } = "1,2,3,4,5";
    public int VacationDaysAllowed { get; set; } = 25;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int? BusinessId { get; set; }
}
