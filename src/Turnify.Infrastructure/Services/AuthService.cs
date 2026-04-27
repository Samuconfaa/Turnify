using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        ICompanyRepository companyRepository,
        IConfiguration config,
        IEmailService emailService)
    {
        _userRepository    = userRepository;
        _companyRepository = companyRepository;
        _config            = config;
        _emailService      = emailService;
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, ct);
        if (user == null || !user.IsActive) return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;

        user.LastLoginAt = DateTime.UtcNow;
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenExpiryDays"));

        await _userRepository.UpdateAsync(user, ct);

        return (token, refreshToken);
    }

    public async Task<(string AccessToken, string RefreshToken)?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var users = await _userRepository.GetActiveUsersWithValidRefreshTokenAsync(ct);
        var user = users.FirstOrDefault(u => u.RefreshTokenHash != null && BCrypt.Net.BCrypt.Verify(refreshToken, u.RefreshTokenHash));
        
        if (user == null) return null;

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(newRefreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenExpiryDays"));

        await _userRepository.UpdateAsync(user, ct);

        return (newAccessToken, newRefreshToken);
    }

    public async Task<bool> RegisterCompanyAsync(Company company, User adminUser, CancellationToken ct = default)
    {
        var existingCompany = await _companyRepository.ExistsBySlugAsync(company.Slug, ct);
        if (existingCompany) return false;

        var existingUser = await _userRepository.ExistsByEmailAsync(adminUser.Email, ct);
        if (existingUser) return false;

        company.CreatedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;
        company.IsActive = true;
        
        var createdCompany = await _companyRepository.AddAsync(company, ct);

        adminUser.CompanyId = createdCompany.Id;
        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminUser.PasswordHash);
        adminUser.Role = UserRole.Admin;
        adminUser.IsActive = true;
        adminUser.CreatedAt = DateTime.UtcNow;
        adminUser.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.AddAsync(adminUser, ct);

        return true;
    }

    public async Task<bool> LogoutAsync(int userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user != null)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiryTime = null;
            await _userRepository.UpdateAsync(user, ct);
            return true;
        }
        return false;
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret missing");
        var issuer = _config["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer missing");
        var audience = _config["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience missing");
        var expiryMinutes = _config.GetValue<int>("Jwt:AccessTokenExpiryMinutes");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("companyId", user.CompanyId.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<bool> ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, ct);
        if (user == null || !user.IsActive) return true; // non rivelare se l'email esiste

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = BCrypt.Net.BCrypt.HashPassword(rawToken);
        user.PasswordResetTokenExpiryTime = DateTime.UtcNow.AddHours(2);
        await _userRepository.UpdateAsync(user, ct);

        var appUrl   = _config["App:BaseUrl"] ?? "https://samuconfa.it/turnify";
        var resetLink = $"{appUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}&email={Uri.EscapeDataString(email)}";

        var html = $"""
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#1E40AF">Reimposta la tua password</h2>
              <p>Hai richiesto di reimpostare la password per il tuo account Turnify.</p>
              <p>Clicca il pulsante qui sotto. Il link scade tra <strong>2 ore</strong>.</p>
              <a href="{resetLink}"
                 style="display:inline-block;background:#2563EB;color:white;padding:12px 24px;
                        border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                Reimposta password
              </a>
              <p style="color:#9CA3AF;font-size:12px">
                Se non hai richiesto il reset, ignora questa email.
              </p>
            </div>
            """;

        await _emailService.SendAsync(email, "Reimposta la tua password — Turnify", html, ct);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        var users = await _userRepository.GetUsersWithValidResetTokenAsync(ct);
        var user  = users.FirstOrDefault(u =>
            u.PasswordResetToken != null &&
            u.PasswordResetTokenExpiryTime > DateTime.UtcNow &&
            BCrypt.Net.BCrypt.Verify(token, u.PasswordResetToken));

        if (user == null) return false;

        user.PasswordHash                 = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken           = null;
        user.PasswordResetTokenExpiryTime = null;
        user.RefreshTokenHash             = null;
        user.RefreshTokenExpiryTime       = null;
        await _userRepository.UpdateAsync(user, ct);
        return true;
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
