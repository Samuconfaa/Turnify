using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;

namespace Turnify.Api.Controllers;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record UpdateAvatarEmojiRequest(string? AvatarEmoji);

[ApiController]
[Route("api/users")]
[Authorize]
public partial class UsersController : ControllerBase
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
            id          = user.Id,
            email       = user.Email,
            role        = user.Role.ToString(),
            companyId   = user.CompanyId,
            employeeId  = employee?.Id ?? 0,
            firstName   = employee?.FirstName ?? string.Empty,
            lastName    = employee?.LastName ?? string.Empty,
            phone       = employee?.Phone ?? string.Empty,
            avatarEmoji = user.AvatarEmoji
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

        if (request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsUpper) ||
            !request.NewPassword.Any(char.IsDigit))
            return BadRequest(new { message = "La password deve avere almeno 8 caratteri, una maiuscola e un numero." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user, ct);

        return NoContent();
    }

    [HttpPut("me/avatar-emoji")]
    public async Task<IActionResult> UpdateAvatarEmoji([FromBody] UpdateAvatarEmojiRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return NotFound();

        user.AvatarEmoji = string.IsNullOrWhiteSpace(request.AvatarEmoji) ? null : request.AvatarEmoji.Trim();
        await _userRepository.UpdateAsync(user, ct);

        return Ok(new { avatarEmoji = user.AvatarEmoji });
    }
}
