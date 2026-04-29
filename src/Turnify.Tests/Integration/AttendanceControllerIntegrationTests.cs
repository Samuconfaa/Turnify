using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

// ATT-01..ATT-07, EDGE-02, EDGE-09
public class AttendanceControllerIntegrationTests : IntegrationTestBase
{
    private const int CompanyId     = 20;
    private const int EmployeeUserId = 200;
    private const int OtherUserId    = 201;

    public AttendanceControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    private async Task<int> SeedEmployeeAsync()
    {
        using var db = GetDb();
        var emp = new Employee
        {
            CompanyId    = CompanyId,
            UserId       = EmployeeUserId,
            FirstName    = "Anna",
            LastName     = "Verdi",
            Email        = $"anna_{Guid.NewGuid()}@test.it",
            IsActive     = true,
            ContractType = ContractType.FullTime,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };
        db.Employees.Add(emp);
        await db.SaveChangesAsync();
        return emp.Id;
    }

    // ATT-05 — GET /api/attendance/today prima di qualsiasi check-in
    [Fact]
    public async Task GetToday_NoCheckIn_ReturnsNotCheckedIn()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.GetAsync("/turnify/api/attendance/today");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isCheckedIn").GetBoolean().Should().BeFalse();
        body.GetProperty("checkInTime").ValueKind.Should().Be(JsonValueKind.Null);
    }

    // ATT-01 — check-in primo del giorno: 200 con checkInTime
    [Fact]
    public async Task CheckIn_FirstTimeToday_Returns200()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("checkInTime").GetString().Should().NotBeNullOrEmpty();
    }

    // ATT-04 — GET /api/attendance/today dopo check-in
    [Fact]
    public async Task GetToday_AfterCheckIn_ReturnsCheckedIn()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });

        var res = await Client.GetAsync("/turnify/api/attendance/today");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isCheckedIn").GetBoolean().Should().BeTrue();
        body.GetProperty("checkInTime").GetString().Should().NotBeNullOrEmpty();
        body.GetProperty("checkOutTime").ValueKind.Should().Be(JsonValueKind.Null);
    }

    // ATT-02 / EDGE-02 — check-in doppio senza checkout: 409 con body { message }
    [Fact]
    public async Task CheckIn_Twice_Returns409WithMessage()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });
        var res = await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });

        res.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("message").GetString().Should().Be("Sei già entrato oggi.");
    }

    // ATT-03 — check-out dopo check-in: 200 con checkOutTime
    [Fact]
    public async Task CheckOut_AfterCheckIn_Returns200()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });
        var res = await Client.PostAsync("/turnify/api/attendance/checkout", null);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("checkOutTime").GetString().Should().NotBeNullOrEmpty();
    }

    // ATT-07 / EDGE-09 — user senza Employee associato → 403
    [Fact]
    public async Task CheckIn_UserWithoutEmployee_Returns403()
    {
        // OtherUserId non ha un Employee in DB
        AuthenticateAs(OtherUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // checkout senza check-in attivo → 409
    [Fact]
    public async Task CheckOut_WithoutCheckIn_Returns409()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsync("/turnify/api/attendance/checkout", null);

        res.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    // GET /api/attendance/history — restituisce lista paginata
    [Fact]
    public async Task GetHistory_AfterCheckInAndOut_ReturnsEntry()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        await Client.PostAsJsonAsync("/turnify/api/attendance/checkin", new { shiftId = (int?)null });
        await Client.PostAsync("/turnify/api/attendance/checkout", null);

        var from = DateTime.UtcNow.AddDays(-1).ToString("o");
        var to   = DateTime.UtcNow.AddDays(1).ToString("o");
        var res  = await Client.GetAsync($"/turnify/api/attendance/history?from={from}&to={to}");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body  = await res.Content.ReadFromJsonAsync<JsonElement>();
        var total = body.GetProperty("total").GetInt32();
        total.Should().BeGreaterThan(0);
    }

    // GET /api/attendance/monthly-summary — restituisce daysWorked e totalHours
    [Fact]
    public async Task GetMonthlySummary_Returns200()
    {
        await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var year  = DateTime.UtcNow.Year;
        var month = DateTime.UtcNow.Month;
        var res   = await Client.GetAsync($"/turnify/api/attendance/monthly-summary?year={year}&month={month}");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("year").GetInt32().Should().Be(year);
        body.GetProperty("month").GetInt32().Should().Be(month);
        body.GetProperty("daysWorked").GetInt32().Should().BeGreaterThanOrEqualTo(0);
    }
}
