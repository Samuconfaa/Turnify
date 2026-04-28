using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

public class ShiftsControllerIntegrationTests : IntegrationTestBase
{
    private const int CompanyId  = 10;
    private const int AdminId    = 100;
    private const int EmployeeUserId = 101;

    public ShiftsControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    private async Task<int> SeedEmployeeAsync(TurnifyDbContext db)
    {
        var emp = new Employee
        {
            CompanyId  = CompanyId,
            UserId     = EmployeeUserId,
            FirstName  = "Mario",
            LastName   = "Rossi",
            Email      = $"mario_{Guid.NewGuid()}@test.it",
            IsActive   = true,
            ContractType = ContractType.FullTime
        };
        db.Employees.Add(emp);
        await db.SaveChangesAsync();
        return emp.Id;
    }

    private async Task<(int empId, int shiftId)> SeedShiftAsync()
    {
        using var db = GetDb();
        int empId = await SeedEmployeeAsync(db);
        var shift = new Shift
        {
            CompanyId       = CompanyId,
            EmployeeId      = empId,
            StartTime       = DateTime.UtcNow.Date.AddHours(9),
            EndTime         = DateTime.UtcNow.Date.AddHours(17),
            Label           = "Test shift",
            Status          = ShiftStatus.Scheduled,
            CreatedByUserId = AdminId
        };
        db.Shifts.Add(shift);
        await db.SaveChangesAsync();
        return (empId, shift.Id);
    }

    // ── GET /api/shifts (autenticazione) ────────────────────────────

    [Fact]
    public async Task GetShifts_Unauthenticated_Returns401()
    {
        Client.DefaultRequestHeaders.Authorization = null;
        var from = DateTime.UtcNow.Date.ToString("o");
        var to   = DateTime.UtcNow.Date.AddDays(7).ToString("o");
        var res  = await Client.GetAsync($"/turnify/api/shifts?from={from}&to={to}");
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetShifts_AsAdmin_Returns200WithData()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var from = DateTime.UtcNow.Date.ToString("o");
        var to   = DateTime.UtcNow.Date.AddDays(7).ToString("o");

        var res = await Client.GetAsync($"/turnify/api/shifts?from={from}&to={to}");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("data").ValueKind.Should().Be(JsonValueKind.Array);
        body.GetProperty("total").GetInt32().Should().BeGreaterThanOrEqualTo(0);
    }

    // ── POST /api/shifts ─────────────────────────────────────────────

    [Fact]
    public async Task CreateShift_AsAdmin_Returns201()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        using var db  = GetDb();
        int empId = await SeedEmployeeAsync(db);

        var start = DateTime.UtcNow.Date.AddDays(10).AddHours(9);
        var end   = start.AddHours(8);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts", new
        {
            employeeId = empId,
            startTime  = start.ToString("o"),
            endTime    = end.ToString("o"),
            label      = "Apertura",
            note       = "",
            isRecurring = false
        });

        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("id").GetInt32().Should().BeGreaterThan(0);
        body.GetProperty("label").GetString().Should().Be("Apertura");
    }

    [Fact]
    public async Task CreateShift_AsEmployee_Returns403()
    {
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);
        using var db = GetDb();
        int empId = await SeedEmployeeAsync(db);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts", new
        {
            employeeId  = empId,
            startTime   = DateTime.UtcNow.AddDays(5).AddHours(9).ToString("o"),
            endTime     = DateTime.UtcNow.AddDays(5).AddHours(17).ToString("o"),
            label       = "Test",
            isRecurring = false
        });

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateShift_EndBeforeStart_Returns400()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        using var db = GetDb();
        int empId = await SeedEmployeeAsync(db);

        var start = DateTime.UtcNow.AddDays(5).AddHours(17);
        var end   = DateTime.UtcNow.AddDays(5).AddHours(9);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts", new
        {
            employeeId  = empId,
            startTime   = start.ToString("o"),
            endTime     = end.ToString("o"),
            label       = "Sbagliato",
            isRecurring = false
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateShift_OverlappingShift_Returns409()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var (empId, _) = await SeedShiftAsync();

        // Turno che si sovrappone con quello seminato
        var start = DateTime.UtcNow.Date.AddHours(10);
        var end   = start.AddHours(4);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts", new
        {
            employeeId  = empId,
            startTime   = start.ToString("o"),
            endTime     = end.ToString("o"),
            label       = "Overlap",
            isRecurring = false
        });

        res.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    // ── GET /api/shifts/{id} ─────────────────────────────────────────

    [Fact]
    public async Task GetShiftById_AsAdmin_Returns200()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var (_, shiftId) = await SeedShiftAsync();

        var res = await Client.GetAsync($"/turnify/api/shifts/{shiftId}");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("id").GetInt32().Should().Be(shiftId);
    }

    [Fact]
    public async Task GetShiftById_NonExistent_Returns404()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var res = await Client.GetAsync("/turnify/api/shifts/99999999");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── PUT /api/shifts/{id} ─────────────────────────────────────────

    [Fact]
    public async Task UpdateShift_AsAdmin_Returns200()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var (_, shiftId) = await SeedShiftAsync();

        var newStart = DateTime.UtcNow.Date.AddDays(20).AddHours(8);
        var newEnd   = newStart.AddHours(8);

        var res = await Client.PutAsJsonAsync($"/turnify/api/shifts/{shiftId}", new
        {
            startTime   = newStart.ToString("o"),
            endTime     = newEnd.ToString("o"),
            label       = "Modificato",
            note        = "update test",
            status      = "Scheduled",
            isRecurring = false
        });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("label").GetString().Should().Be("Modificato");
    }

    // ── DELETE /api/shifts/{id} ──────────────────────────────────────

    [Fact]
    public async Task DeleteShift_AsAdmin_Returns204()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var (_, shiftId) = await SeedShiftAsync();

        var res = await Client.DeleteAsync($"/turnify/api/shifts/{shiftId}");
        res.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verifica eliminazione
        var check = await Client.GetAsync($"/turnify/api/shifts/{shiftId}");
        check.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteShift_AsEmployee_Returns403()
    {
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);
        var res = await Client.DeleteAsync("/turnify/api/shifts/1");
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ── POST /api/shifts/recurring ───────────────────────────────────

    [Fact]
    public async Task CreateRecurringShifts_4Weeks_Returns200With4Shifts()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        using var db = GetDb();
        int empId = await SeedEmployeeAsync(db);

        var start = DateTime.UtcNow.Date.AddDays(30).AddHours(9);
        var end   = start.AddHours(8);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts/recurring", new
        {
            employeeId = empId,
            startTime  = start.ToString("o"),
            endTime    = end.ToString("o"),
            label      = "Turno settimanale",
            weeks      = 4
        });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("created").GetInt32().Should().Be(4);
    }

    [Fact]
    public async Task CreateRecurringShifts_InvalidWeeks_Returns400()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        using var db = GetDb();
        int empId = await SeedEmployeeAsync(db);

        var res = await Client.PostAsJsonAsync("/turnify/api/shifts/recurring", new
        {
            employeeId = empId,
            startTime  = DateTime.UtcNow.AddDays(1).ToString("o"),
            endTime    = DateTime.UtcNow.AddDays(1).AddHours(8).ToString("o"),
            weeks      = 100
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
