using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly TurnifyDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(TurnifyDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user == null || !user.IsActive) return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;

        user.LastLoginAt = DateTime.UtcNow;
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenExpiryDays"));

        await _context.SaveChangesAsync(ct);

        return (token, refreshToken);
    }

    public async Task<(string AccessToken, string RefreshToken)?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var users = await _context.Users.Where(u => u.RefreshTokenExpiryTime > DateTime.UtcNow).ToListAsync(ct);
        var user = users.FirstOrDefault(u => u.RefreshTokenHash != null && BCrypt.Net.BCrypt.Verify(refreshToken, u.RefreshTokenHash));
        
        if (user == null || !user.IsActive) return null;

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(newRefreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenExpiryDays"));

        await _context.SaveChangesAsync(ct);

        return (newAccessToken, newRefreshToken);
    }

    public async Task<bool> RegisterCompanyAsync(Company company, User adminUser, CancellationToken ct = default)
    {
        var existingCompany = await _context.Companies.AnyAsync(c => c.Slug == company.Slug, ct);
        if (existingCompany) return false;

        var existingUser = await _context.Users.AnyAsync(u => u.Email == adminUser.Email, ct);
        if (existingUser) return false;

        company.CreatedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;
        company.IsActive = true;
        _context.Companies.Add(company);
        await _context.SaveChangesAsync(ct); // Save to get CompanyId

        adminUser.CompanyId = company.Id;
        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminUser.PasswordHash);
        adminUser.Role = UserRole.Admin;
        adminUser.IsActive = true;
        adminUser.CreatedAt = DateTime.UtcNow;
        adminUser.UpdatedAt = DateTime.UtcNow;
        _context.Users.Add(adminUser);

        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> LogoutAsync(int userId, CancellationToken ct = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, ct);
        if (user != null)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync(ct);
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

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
