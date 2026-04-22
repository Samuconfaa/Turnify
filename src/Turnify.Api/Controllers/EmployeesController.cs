using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

public class CreateEmployeeRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public decimal WeeklyHours { get; set; }
    public int? BusinessId { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class UpdateEmployeeRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public decimal WeeklyHours { get; set; }
    public int? BusinessId { get; set; }
    public bool IsActive { get; set; }
}

[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;

    public EmployeesController(IEmployeeRepository employeeRepository, IUserRepository userRepository)
    {
        _employeeRepository = employeeRepository;
        _userRepository = userRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsAdmin()
    {
        return User.IsInRole(UserRole.Admin.ToString());
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployees([FromQuery] int? businessId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();
        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, businessId, ct);

        var dtos = employees.Select(MapToDto).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();

        if (await _userRepository.ExistsByEmailAsync(request.Email, ct))
        {
            return BadRequest(new { message = "Email già in uso." });
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Employee,
            CompanyId = companyId,
            IsActive = true
        };

        var createdUser = await _userRepository.AddAsync(user, ct);

        var contractType = Enum.TryParse<ContractType>(request.ContractType, true, out var ctEnum) 
            ? ctEnum 
            : ContractType.FullTime;

        var employee = new Employee
        {
            CompanyId = companyId,
            UserId = createdUser.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Role = request.Role,
            ContractType = contractType,
            WeeklyHours = request.WeeklyHours,
            IsActive = true,
            BusinessId = request.BusinessId,
            HireDate = DateTime.UtcNow
        };

        var createdEmployee = await _employeeRepository.AddAsync(employee, ct);

        return Created($"/api/employees/{createdEmployee.Id}", MapToDto(createdEmployee));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployee(int id, CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();

        var companyId = GetCompanyId();
        if (employee.CompanyId != companyId) return Forbid();

        if (!IsAdmin() && employee.UserId != GetUserId())
        {
            return Forbid();
        }

        return Ok(MapToDto(employee));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();

        if (employee.CompanyId != GetCompanyId()) return Forbid();

        var contractType = Enum.TryParse<ContractType>(request.ContractType, true, out var ctEnum) 
            ? ctEnum 
            : employee.ContractType;

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Phone = request.Phone;
        employee.Role = request.Role;
        employee.ContractType = contractType;
        employee.WeeklyHours = request.WeeklyHours;
        employee.BusinessId = request.BusinessId;
        employee.IsActive = request.IsActive;

        await _employeeRepository.UpdateAsync(employee, ct);

        if (employee.UserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(employee.UserId.Value, ct);
            if (user != null && user.Email != request.Email)
            {
                user.Email = request.Email;
                await _userRepository.UpdateAsync(user, ct);
            }
        }

        return Ok(MapToDto(employee));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();

        if (employee.CompanyId != GetCompanyId()) return Forbid();

        employee.IsActive = false;
        await _employeeRepository.UpdateAsync(employee, ct);

        if (employee.UserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(employee.UserId.Value, ct);
            if (user != null)
            {
                user.IsActive = false;
                await _userRepository.UpdateAsync(user, ct);
            }
        }

        return NoContent();
    }

    private static EmployeeDto MapToDto(Employee e)
    {
        return new EmployeeDto
        {
            Id = e.Id,
            CompanyId = e.CompanyId,
            UserId = e.UserId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            Phone = e.Phone,
            Role = e.Role,
            ContractType = e.ContractType.ToString(),
            WeeklyHours = e.WeeklyHours,
            IsActive = e.IsActive,
            BusinessId = e.BusinessId
        };
    }
}
