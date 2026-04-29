using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Turnify.Core.Models;

namespace Turnify.Tests.Integration;

// ERR-01, ERR-02, ERR-03, EDGE-07
public class ErrorLogsControllerIntegrationTests : IntegrationTestBase
{
    private const int UserId    = 500;
    private const int CompanyId = 50;

    public ErrorLogsControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    private object ValidPayload() => new
    {
        deviceId   = Guid.NewGuid().ToString(),
        platform   = "Android",
        appVersion = "1.0",
        errorType  = "HttpRequestException",
        message    = "Errore di rete",
        stackTrace = (string?)null,
        screenName = (string?)null,
        occurredAt = DateTime.UtcNow
    };

    // ERR-01 — report errore valido → 200
    [Fact]
    public async Task Report_ValidPayload_Returns200()
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", ValidPayload());

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ERR-01 — senza autenticazione → 401
    [Fact]
    public async Task Report_Unauthenticated_Returns401()
    {
        Client.DefaultRequestHeaders.Authorization = null;

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", ValidPayload());

        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ERR-02 — Platform non valida → 400
    [Fact]
    public async Task Report_InvalidPlatform_Returns400()
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", new
        {
            deviceId   = Guid.NewGuid().ToString(),
            platform   = "Linux",
            appVersion = "1.0",
            errorType  = "Exception",
            message    = "test",
            occurredAt = DateTime.UtcNow
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ERR-03 — Message > 2000 caratteri → 400
    [Fact]
    public async Task Report_MessageTooLong_Returns400()
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", new
        {
            deviceId   = Guid.NewGuid().ToString(),
            platform   = "Android",
            appVersion = "1.0",
            errorType  = "Exception",
            message    = new string('x', 2001),
            occurredAt = DateTime.UtcNow
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // EDGE-07 — StackTrace e ScreenName null → 200 (campi opzionali)
    [Fact]
    public async Task Report_NullableFieldsOmitted_Returns200()
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", new
        {
            deviceId   = Guid.NewGuid().ToString(),
            platform   = "iOS",
            appVersion = "1.0",
            errorType  = "NullReferenceException",
            message    = "Something was null",
            occurredAt = DateTime.UtcNow
            // stackTrace e screenName omessi
        });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // Tutte e 4 le piattaforme valide → 200
    [Theory]
    [InlineData("Android")]
    [InlineData("iOS")]
    [InlineData("Windows")]
    [InlineData("macOS")]
    public async Task Report_AllValidPlatforms_Returns200(string platform)
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", new
        {
            deviceId   = Guid.NewGuid().ToString(),
            platform,
            appVersion = "1.0",
            errorType  = "Exception",
            message    = "test",
            occurredAt = DateTime.UtcNow
        });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // DeviceId vuoto → 400
    [Fact]
    public async Task Report_EmptyDeviceId_Returns400()
    {
        AuthenticateAs(UserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/errorlogs", new
        {
            deviceId   = "",
            platform   = "Android",
            appVersion = "1.0",
            errorType  = "Exception",
            message    = "test",
            occurredAt = DateTime.UtcNow
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
