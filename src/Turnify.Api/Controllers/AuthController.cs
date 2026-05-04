using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using System.Threading;
using System;
using System.Security.Claims;

namespace Turnify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password, ct);
        if (result == null)
            return Unauthorized(); // 401 without details as per AGENTS.md

        return Ok(new TokenResponse { AccessToken = result.Value.AccessToken, RefreshToken = result.Value.RefreshToken });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ct);
        if (result == null)
            return Unauthorized();

        return Ok(new TokenResponse { AccessToken = result.Value.AccessToken, RefreshToken = result.Value.RefreshToken });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var company = new Company
        {
            Name = request.CompanyName,
            Slug = request.CompanySlug,
            Email = request.CompanyEmail
        };

        var admin = new User
        {
            Email = request.AdminEmail,
            PasswordHash = request.AdminPassword
        };

        var success = await _authService.RegisterCompanyAsync(company, admin, ct);
        if (!success)
            return Conflict(new ProblemDetails { Title = "Registration failed", Detail = "Company or user already exists" });

        return Ok();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await _authService.ForgotPasswordAsync(request.Email, ct);
        return Ok(new { message = "Se l'email è registrata, riceverai le istruzioni per il reset." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var success = await _authService.ResetPasswordAsync(request.Token, request.NewPassword, ct);
        if (!success)
            return BadRequest(new { message = "Token non valido o scaduto." });
        return Ok(new { message = "Password reimpostata con successo." });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                     
        if (int.TryParse(userIdStr, out int userId))
        {
            await _authService.LogoutAsync(userId, ct);
        }
        
        return Ok();
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string CompanySlug { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
