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

    public AuthService(IUserRepository userRepository, ICompanyRepository companyRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _config = config;
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
        if (existingUser) throw new InvalidOperationException("Email già in uso.");

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

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
