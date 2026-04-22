using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;

namespace Turnify.Api.Controllers;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public UsersController(IUserRepository userRepository, IEmployeeRepository employeeRepository)
    {
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = GetUserId();

        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        var employee = await _employeeRepository.GetByUserIdAsync(userId, ct);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            role = user.Role.ToString(),
            companyId = user.CompanyId,
            firstName = employee?.FirstName ?? "",
            lastName = employee?.LastName ?? "",
            phone = employee?.Phone ?? ""
        });
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Password attuale errata.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user, ct);

        return NoContent();
    }
}
