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
    public string Username { get; set; } = string.Empty;      // login username (unico per company)
    public string? Email { get; set; }                        // opzionale, solo informativo
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;           // titolo lavorativo (es. "Chef")
    public string AccountRole { get; set; } = "Employee";     // "Employee" | "Manager"
    public string ContractType { get; set; } = string.Empty;
    public decimal WeeklyHours { get; set; }
    public int? BusinessId { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class ResetEmployeePasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateAvailabilityRequest
{
    public string? AvailableDays { get; set; }
}

public class UpdateEmployeeRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Username { get; set; }                  // opzionale: se specificato, aggiorna username
    public string? Email { get; set; }                     // opzionale, solo informativo
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AccountRole { get; set; }               // opzionale: "Employee" | "Manager"
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
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (claim != null && int.TryParse(claim.Value, out int id))
            return id;
        return 0;
    }

    private bool IsAdmin() => User.IsInRole(UserRole.Admin.ToString());

    [HttpGet]
    public async Task<IActionResult> GetEmployees([FromQuery] int? businessId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();
        if (companyId == 0)
            return Unauthorized(new { message = "CompanyId non trovato nel token." });

        var employees = await _employeeRepository.GetAllByCompanyIdAsync(companyId, businessId, ct);

        var dtos = employees.Select(e => MapToDto(e)).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();
        if (companyId == 0)
            return Unauthorized(new { message = "CompanyId non trovato nel token." });

        if (string.IsNullOrWhiteSpace(request.Username))
            return BadRequest(new { message = "Il nome utente è obbligatorio." });

        if (await _userRepository.ExistsByUsernameInCompanyAsync(request.Username, companyId, ct))
            return BadRequest(new { message = "Nome utente già in uso in questa azienda." });

        if (!string.IsNullOrWhiteSpace(request.Email) &&
            await _userRepository.ExistsByEmailAsync(request.Email, ct))
            return BadRequest(new { message = "Email già in uso." });

        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "La password è obbligatoria." });

        if (request.Password.Length < 8 ||
            !request.Password.Any(char.IsUpper) ||
            !request.Password.Any(char.IsDigit))
            return BadRequest(new { message = "La password deve avere almeno 8 caratteri, una maiuscola e un numero." });

        // Accetta solo Employee o Manager — non si può creare un Admin via API
        var accountRole = Enum.TryParse<UserRole>(request.AccountRole, true, out var parsedRole)
                          && parsedRole != UserRole.Admin
            ? parsedRole
            : UserRole.Employee;

        var user = new User
        {
            Username     = request.Username,
            Email        = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role         = accountRole,
            CompanyId    = companyId,
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };
        var createdUser = await _userRepository.AddAsync(user, ct);

        var contractType = Enum.TryParse<ContractType>(request.ContractType, true, out var ct2)
            ? ct2 : ContractType.FullTime;

        var employee = new Employee
        {
            CompanyId    = companyId,
            UserId       = createdUser.Id,
            FirstName    = request.FirstName,
            LastName     = request.LastName,
            Email        = request.Email ?? string.Empty,
            Phone        = request.Phone ?? string.Empty,
            Role         = request.Role ?? string.Empty,
            ContractType = contractType,
            WeeklyHours  = request.WeeklyHours,
            IsActive     = true,
            BusinessId   = request.BusinessId,
            HireDate     = DateTime.UtcNow,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };
        var created = await _employeeRepository.AddAsync(employee, ct);

        return Created($"/api/employees/{created.Id}", MapToDto(created));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployee(int id, CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();

        var companyId = GetCompanyId();
        if (employee.CompanyId != companyId) return Forbid();

        if (!IsAdmin() && employee.UserId != GetUserId())
            return Forbid();

        User? user = employee.UserId.HasValue
            ? await _userRepository.GetByIdAsync(employee.UserId.Value, ct)
            : null;

        return Ok(MapToDto(employee, user));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();
        if (employee.CompanyId != GetCompanyId()) return Forbid();

        var contractType = Enum.TryParse<ContractType>(request.ContractType, true, out var ct2)
            ? ct2 : employee.ContractType;

        employee.FirstName    = request.FirstName;
        employee.LastName     = request.LastName;
        employee.Email        = request.Email ?? string.Empty;
        employee.Phone        = request.Phone;
        employee.Role         = request.Role;
        employee.ContractType = contractType;
        employee.WeeklyHours  = request.WeeklyHours;
        employee.BusinessId   = request.BusinessId;
        employee.IsActive     = request.IsActive;

        await _employeeRepository.UpdateAsync(employee, ct);

        if (employee.UserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(employee.UserId.Value, ct);
            if (user != null)
            {
                // Aggiorna username se specificato e diverso da quello attuale
                if (!string.IsNullOrWhiteSpace(request.Username) && user.Username != request.Username)
                {
                    if (await _userRepository.ExistsByUsernameInCompanyAsync(request.Username, employee.CompanyId, ct))
                        return BadRequest(new { message = "Nome utente già in uso in questa azienda." });
                    user.Username = request.Username;
                }

                var newEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email;
                if (user.Email != newEmail)
                    user.Email = newEmail;

                // Aggiorna il ruolo account se specificato (solo Employee o Manager)
                if (!string.IsNullOrEmpty(request.AccountRole) &&
                    Enum.TryParse<UserRole>(request.AccountRole, true, out var newRole) &&
                    newRole != UserRole.Admin)
                {
                    user.Role = newRole;
                }

                await _userRepository.UpdateAsync(user, ct);
            }
        }

        return Ok(MapToDto(employee));
    }

    [HttpPut("{id}/password")]
    public async Task<IActionResult> ResetEmployeePassword(
        int id, [FromBody] ResetEmployeePasswordRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null) return NotFound();
        if (employee.CompanyId != GetCompanyId()) return Forbid();

        if (string.IsNullOrWhiteSpace(request.NewPassword) ||
            request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsUpper) ||
            !request.NewPassword.Any(char.IsDigit))
            return BadRequest(new { message = "La password deve avere almeno 8 caratteri, una maiuscola e un numero." });

        if (!employee.UserId.HasValue) return NotFound(new { message = "Nessun account associato a questo dipendente." });

        var user = await _userRepository.GetByIdAsync(employee.UserId.Value, ct);
        if (user == null) return NotFound();

        user.PasswordHash             = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.RefreshTokenHash         = null;
        user.RefreshTokenExpiryTime   = null;
        await _userRepository.UpdateAsync(user, ct);

        return NoContent();
    }

    /// <summary>GET /api/employees/{id}/availability — giorni disponibili di un dipendente (admin)</summary>
    [HttpGet("{id}/availability")]
    public async Task<IActionResult> GetAvailability(int id, CancellationToken ct)
    {
        var companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized();

        var employee = await _employeeRepository.GetByIdAsync(id, ct);
        if (employee == null || employee.CompanyId != companyId) return StatusCode(403);

        var days = (employee.AvailableDays ?? "1,2,3,4,5")
            .Split(',', System.StringSplitOptions.RemoveEmptyEntries)
            .Select(d => int.TryParse(d.Trim(), out var n) ? n : -1)
            .Where(n => n >= 0)
            .ToArray();

        return Ok(new { availableDays = days });
    }

    [HttpGet("me/availability")]
    public async Task<IActionResult> GetMyAvailability(CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return NotFound();
        return Ok(new { availableDays = employee.AvailableDays });
    }

    [HttpPut("me/availability")]
    public async Task<IActionResult> UpdateMyAvailability(
        [FromBody] UpdateAvailabilityRequest request, CancellationToken ct)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(GetUserId(), ct);
        if (employee == null) return NotFound();
        employee.AvailableDays = request.AvailableDays ?? "1,2,3,4,5";
        await _employeeRepository.UpdateAsync(employee, ct);
        return Ok(new { availableDays = employee.AvailableDays });
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

    private static EmployeeDto MapToDto(Employee e, User? user = null) => new()
    {
        Id           = e.Id,
        CompanyId    = e.CompanyId,
        UserId       = e.UserId,
        FirstName    = e.FirstName,
        LastName     = e.LastName,
        Username     = user?.Username,
        Email        = string.IsNullOrEmpty(e.Email) ? null : e.Email,
        Phone        = e.Phone,
        Role         = e.Role,
        AccountRole  = user?.Role.ToString() ?? "Employee",
        ContractType = e.ContractType.ToString(),
        WeeklyHours  = e.WeeklyHours,
        IsActive     = e.IsActive,
        BusinessId   = e.BusinessId
    };
}
