using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

// EMP-04, EMP-06
public class EmployeesControllerIntegrationTests : IntegrationTestBase
{
    private const int CompanyA       = 40;
    private const int CompanyB       = 41;
    private const int AdminA         = 400;
    private const int AdminB         = 401;
    private const int EmployeeUserId = 402;

    public EmployeesControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    private async Task<int> SeedEmployeeAsync(int companyId, int userId)
    {
        using var db = GetDb();
        var emp = new Employee
        {
            CompanyId    = companyId,
            UserId       = userId,
            FirstName    = "Test",
            LastName     = "Emp",
            Email        = $"emp_{Guid.NewGuid()}@test.it",
            IsActive     = true,
            ContractType = ContractType.FullTime,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };
        db.Employees.Add(emp);
        await db.SaveChangesAsync();
        return emp.Id;
    }

    // EMP-04 — dipendente tenta GET /api/employees → 403
    [Fact]
    public async Task GetEmployees_AsEmployee_Returns403()
    {
        AuthenticateAs(EmployeeUserId, CompanyA, UserRole.Employee);

        var res = await Client.GetAsync("/turnify/api/employees");

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // Admin può leggere la lista dipendenti → 200
    [Fact]
    public async Task GetEmployees_AsAdmin_Returns200()
    {
        await SeedEmployeeAsync(CompanyA, EmployeeUserId);
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);

        var res = await Client.GetAsync("/turnify/api/employees");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<JsonElement[]>();
        list.Should().NotBeNull();
    }

    // EMP-06 — admin di azienda A non vede dipendenti di azienda B
    [Fact]
    public async Task GetEmployees_AdminSeesOnlyOwnCompany()
    {
        await SeedEmployeeAsync(CompanyA, EmployeeUserId);
        // Nessun dipendente per CompanyB nel DB

        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);
        var res = await Client.GetAsync("/turnify/api/employees");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<JsonElement[]>();
        list.Should().NotBeNull();
        list!.All(e => e.GetProperty("companyId").GetInt32() == CompanyA)
            .Should().BeTrue("l'admin vede solo i dipendenti della propria azienda");
    }

    // POST /api/employees — admin crea dipendente valido → 201
    [Fact]
    public async Task CreateEmployee_AsAdmin_Returns201()
    {
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);

        var res = await Client.PostAsJsonAsync("/turnify/api/employees", new
        {
            firstName    = "Mario",
            lastName     = "Rossi",
            username     = $"mario_{Guid.NewGuid():N}".Substring(0, 20),
            email        = (string?)null,
            phone        = "",
            role         = "Cassiere",
            accountRole  = "Employee",
            contractType = "FullTime",
            weeklyHours  = 40m,
            businessId   = (int?)null,
            password     = "Password1!"
        });

        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("firstName").GetString().Should().Be("Mario");
    }

    // POST — username vuoto → 400
    [Fact]
    public async Task CreateEmployee_EmptyUsername_Returns400()
    {
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);

        var res = await Client.PostAsJsonAsync("/turnify/api/employees", new
        {
            firstName    = "Mario",
            lastName     = "Rossi",
            username     = "",
            password     = "Password1!",
            contractType = "FullTime",
            weeklyHours  = 40m
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // POST — username duplicato nella stessa azienda → 400
    [Fact]
    public async Task CreateEmployee_DuplicateUsername_Returns400()
    {
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);
        var username = $"dup_{Guid.NewGuid():N}".Substring(0, 20);

        // Primo dipendente
        await Client.PostAsJsonAsync("/turnify/api/employees", new
        {
            firstName    = "First",
            lastName     = "User",
            username,
            password     = "Password1!",
            contractType = "FullTime",
            weeklyHours  = 40m
        });

        // Secondo con stesso username
        var res = await Client.PostAsJsonAsync("/turnify/api/employees", new
        {
            firstName    = "Second",
            lastName     = "User",
            username,
            password     = "Password1!",
            contractType = "FullTime",
            weeklyHours  = 40m
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // POST — password debole → 400
    [Fact]
    public async Task CreateEmployee_WeakPassword_Returns400()
    {
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);

        var res = await Client.PostAsJsonAsync("/turnify/api/employees", new
        {
            firstName    = "Weak",
            lastName     = "Pass",
            username     = $"weakpass_{Guid.NewGuid():N}".Substring(0, 20),
            password     = "abc",
            contractType = "FullTime",
            weeklyHours  = 40m
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // DELETE — soft delete: dipendente disattivato, non rimosso
    [Fact]
    public async Task DeleteEmployee_AsAdmin_Returns204AndDeactivates()
    {
        var empId = await SeedEmployeeAsync(CompanyA, EmployeeUserId);
        AuthenticateAs(AdminA, CompanyA, UserRole.Admin);

        var res = await Client.DeleteAsync($"/turnify/api/employees/{empId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Dipendente ancora presente ma IsActive = false
        var check = await Client.GetAsync($"/turnify/api/employees/{empId}");
        check.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await check.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isActive").GetBoolean().Should().BeFalse();
    }

    // GET /api/employees/me/availability — dipendente legge disponibilità
    [Fact]
    public async Task GetMyAvailability_AsEmployee_Returns200()
    {
        await SeedEmployeeAsync(CompanyA, EmployeeUserId);
        AuthenticateAs(EmployeeUserId, CompanyA, UserRole.Employee);

        var res = await Client.GetAsync("/turnify/api/employees/me/availability");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // PUT /api/employees/me/availability — dipendente aggiorna disponibilità
    [Fact]
    public async Task UpdateMyAvailability_AsEmployee_Returns200()
    {
        await SeedEmployeeAsync(CompanyA, EmployeeUserId);
        AuthenticateAs(EmployeeUserId, CompanyA, UserRole.Employee);

        var res = await Client.PutAsJsonAsync("/turnify/api/employees/me/availability",
            new { availableDays = "1,2,3,4,5" });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("availableDays").GetString().Should().Be("1,2,3,4,5");
    }
}
