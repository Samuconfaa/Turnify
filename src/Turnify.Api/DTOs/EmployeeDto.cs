namespace Turnify.Api.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccountRole { get; set; } = "Employee";
    public string ContractType { get; set; } = string.Empty;
    public decimal WeeklyHours { get; set; }
    public bool IsActive { get; set; }
    public int? BusinessId { get; set; }
}
