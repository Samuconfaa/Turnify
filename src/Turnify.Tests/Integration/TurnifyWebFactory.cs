using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

public class TurnifyWebFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Sostituisce il DbContext reale con uno in-memory
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<TurnifyDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<TurnifyDbContext>(options =>
                options.UseInMemoryDatabase("TurnifyIntegrationTest_" + Guid.NewGuid()));

            // Configura JWT per i test
            services.Configure<Microsoft.Extensions.Options.ConfigureNamedOptions<
                Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerOptions>>(
                Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme,
                _ => { });

            // Crea il database in-memory
            using var sp = services.BuildServiceProvider();
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
