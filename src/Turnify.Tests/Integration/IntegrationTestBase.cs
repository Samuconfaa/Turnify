using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

public abstract class IntegrationTestBase : IClassFixture<TurnifyWebFactory>, IDisposable
{
    protected readonly HttpClient Client;
    protected readonly TurnifyWebFactory Factory;

    private const string JwtSecret  = "SuperSecretKeyForIntegrationTestOnly!123";
    private const string JwtIssuer  = "TurnifyTest";
    private const string JwtAudience = "TurnifyTestUsers";

    protected IntegrationTestBase(TurnifyWebFactory factory)
    {
        Factory = factory;
        Client  = factory.CreateClient();
    }

    protected void AuthenticateAs(int userId, int companyId, UserRole role)
    {
        var token = GenerateJwt(userId, companyId, role);
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private static string GenerateJwt(int userId, int companyId, UserRole role)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("companyId", companyId.ToString()),
            new Claim(ClaimTypes.Role, role.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, $"test{userId}@turnify.test"),
        };

        var token = new JwtSecurityToken(
            issuer:             JwtIssuer,
            audience:           JwtAudience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    protected TurnifyDbContext GetDb()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<TurnifyDbContext>();
    }

    protected async Task SeedAsync(Action<TurnifyDbContext> seed)
    {
        using var db = GetDb();
        seed(db);
        await db.SaveChangesAsync();
    }

    public void Dispose()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }
}
