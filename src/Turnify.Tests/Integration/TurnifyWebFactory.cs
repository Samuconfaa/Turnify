using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.InMemory.Infrastructure.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

public class TurnifyWebFactory : WebApplicationFactory<Program>
{
    // Opzioni pre-costruite con database in-memory univoco per questa factory.
    // Tutti i DbContext (HTTP requests + seed diretti) usano le stesse opzioni
    // e quindi lo stesso database in-memory.
    private readonly DbContextOptions<TurnifyDbContext> _dbOptions =
        new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase($"TurnifyTest_{Guid.NewGuid():N}")
            .Options;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Rimuove TUTTE le registrazioni EF Core legate a TurnifyDbContext
            // (incluso il DbContext stesso) per ricominciare da zero.
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(TurnifyDbContext) ||
                    d.ServiceType == typeof(DbContextOptions<TurnifyDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>) &&
                     d.ServiceType.GenericTypeArguments[0] == typeof(TurnifyDbContext)))
                .ToList();

            foreach (var d in toRemove)
                services.Remove(d);

            // Re-registra il DbContext come scoped con le opzioni pre-costruite.
            // Tutti i scope (HTTP requests e GetDb() nei test) usano le stesse
            // _dbOptions e quindi lo stesso database in-memory.
            services.AddScoped<TurnifyDbContext>(_ => new TurnifyDbContext(_dbOptions));

            // Sovrascrive i parametri JWT con il segreto di test, che deve coincidere
            // con quello usato in IntegrationTestBase.GenerateJwt.
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer           = true,
                    ValidIssuer              = "TurnifyTest",
                    ValidateAudience         = true,
                    ValidAudience            = "TurnifyTestUsers",
                    ValidateLifetime         = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes("SuperSecretKeyForIntegrationTestOnly!123")),
                    ClockSkew                = TimeSpan.Zero
                };
            });

            // Crea il database in-memory (schema) prima dell'esecuzione dei test
            using var sp    = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<TurnifyDbContext>();
            db.Database.EnsureCreated();
        });

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"]                    = "SuperSecretKeyForIntegrationTestOnly!123",
                ["Jwt:Issuer"]                    = "TurnifyTest",
                ["Jwt:Audience"]                  = "TurnifyTestUsers",
                ["Jwt:AccessTokenExpiryMinutes"]  = "15",
                ["Jwt:RefreshTokenExpiryDays"]    = "7",
                ["ConnectionStrings:Default"]     = "dummy",
            });
        });
    }
}
