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
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    /// <summary>
    /// Returns the current authenticated user's profile, including their employeeId.
    /// Fix: expose employeeId so the mobile app can submit vacation requests correctly.
    /// </summary>
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
            // Fix 4: expose employeeId so mobile can use it for vacation requests
            employeeId = employee?.Id ?? 0,
            firstName = employee?.FirstName ?? string.Empty,
            lastName = employee?.LastName ?? string.Empty,
            phone = employee?.Phone ?? string.Empty
        });
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Password attuale errata." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user, ct);

        return NoContent();
    }
}
