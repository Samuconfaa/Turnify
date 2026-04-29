using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

public class AuthControllerIntegrationTests : IntegrationTestBase
{
    public AuthControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    // ── POST /api/auth/login ─────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithTokens()
    {
        // Arrange — crea utente nel db in-memory
        var password = "Password1!";
        var email    = $"login_ok_{Guid.NewGuid()}@test.it";
        await SeedAsync(db => db.Users.Add(new User
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role         = UserRole.Admin,
            CompanyId    = 1,
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        }));

        // Act
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login", new { email, password });

        // Assert
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("accessToken").GetString().Should().NotBeNullOrEmpty();
        body.GetProperty("refreshToken").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email    = $"login_bad_{Guid.NewGuid()}@test.it";
        await SeedAsync(db => db.Users.Add(new User
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword1!"),
            Role         = UserRole.Employee,
            CompanyId    = 1,
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        }));

        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login",
            new { email, password = "WrongPassword" });

        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_UnknownEmail_Returns401()
    {
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login",
            new { email = "nobody@turnify.test", password = "anything" });

        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_EmptyBody_Returns400()
    {
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login",
            new { email = "", password = "" });

        // FluentValidation intercetta — deve essere 400
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_InvalidEmailFormat_Returns400()
    {
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login",
            new { email = "not-an-email", password = "Password1!" });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_InactiveUser_Returns401()
    {
        var email    = $"inactive_{Guid.NewGuid()}@test.it";
        await SeedAsync(db => db.Users.Add(new User
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
            Role         = UserRole.Employee,
            CompanyId    = 1,
            IsActive     = false,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        }));

        var res = await Client.PostAsJsonAsync("/turnify/api/auth/login",
            new { email, password = "Password1!" });

        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── POST /api/auth/register ──────────────────────────────────────

    [Fact]
    public async Task Register_ValidData_Returns200()
    {
        var slug = $"azienda-{Guid.NewGuid():N}".Substring(0, 30);
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/register", new
        {
            companyName   = "Azienda Test",
            companySlug   = slug,
            companyEmail  = $"info+{slug}@azienda.it",
            adminEmail    = $"admin+{slug}@azienda.it",
            adminPassword = "Admin1234!"
        });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_WeakPassword_Returns400()
    {
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/register", new
        {
            companyName   = "Test",
            companySlug   = "test-slug-weak",
            companyEmail  = "info@test.it",
            adminEmail    = "admin@test.it",
            adminPassword = "abc"
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_InvalidSlug_Returns400()
    {
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/register", new
        {
            companyName   = "Test",
            companySlug   = "Invalid Slug With Spaces!",
            companyEmail  = "info@test.it",
            adminEmail    = "admin@test.it",
            adminPassword = "Admin1234!"
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── POST /api/auth/forgot-password ──────────────────────────────

    [Fact]
    public async Task ForgotPassword_AnyEmail_Returns200()
    {
        // Non rivela se l'email esiste o meno
        var res = await Client.PostAsJsonAsync("/turnify/api/auth/forgot-password",
            new { email = "chiunque@test.it" });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("message").GetString().Should().Contain("istruzioni");
    }

    // ── POST /api/auth/logout (richiede autenticazione) ─────────────

    [Fact]
    public async Task Logout_WithoutToken_Returns401()
    {
        Client.DefaultRequestHeaders.Authorization = null;
        var res = await Client.PostAsync("/turnify/api/auth/logout", null);
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_WithToken_Returns200()
    {
        var email    = $"logout_{Guid.NewGuid()}@test.it";
        await SeedAsync(db => db.Users.Add(new User
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
            Role         = UserRole.Admin,
            CompanyId    = 1,
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        }));
        AuthenticateAs(999, 1, UserRole.Admin);
        var res = await Client.PostAsync("/turnify/api/auth/logout", null);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
