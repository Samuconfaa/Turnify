using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

// VAC-01..VAC-10, EDGE-05
public class VacationRequestsControllerIntegrationTests : IntegrationTestBase
{
    private const int CompanyId      = 30;
    private const int AdminId        = 300;
    private const int EmployeeUserId = 301;
    private const int OtherCompanyId = 31;

    public VacationRequestsControllerIntegrationTests(TurnifyWebFactory factory) : base(factory) { }

    private async Task<int> SeedEmployeeAsync(int userId = EmployeeUserId, int companyId = CompanyId)
    {
        using var db = GetDb();
        var emp = new Employee
        {
            CompanyId    = companyId,
            UserId       = userId,
            FirstName    = "Luca",
            LastName     = "Bianchi",
            Email        = $"luca_{Guid.NewGuid()}@test.it",
            IsActive     = true,
            ContractType = ContractType.FullTime,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };
        db.Employees.Add(emp);
        await db.SaveChangesAsync();
        return emp.Id;
    }

    private async Task<int> SeedVacationRequestAsync(int employeeId, VacationRequestStatus status = VacationRequestStatus.Pending)
    {
        using var db = GetDb();
        var vr = new VacationRequest
        {
            CompanyId  = CompanyId,
            EmployeeId = employeeId,
            Type       = VacationRequestType.Holiday,
            StartDate  = DateTime.UtcNow.Date.AddDays(10),
            EndDate    = DateTime.UtcNow.Date.AddDays(14),
            TotalDays  = 5,
            Reason     = "Test",
            Status     = status,
            CreatedAt  = DateTime.UtcNow,
            UpdatedAt  = DateTime.UtcNow
        };
        db.VacationRequests.Add(vr);
        await db.SaveChangesAsync();
        return vr.Id;
    }

    // VAC-01 — creazione richiesta valida → 201
    [Fact]
    public async Task Create_ValidRequest_Returns201()
    {
        var empId = await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/vacation-requests", new
        {
            employeeId = empId,
            type       = "Holiday",
            startDate  = DateTime.UtcNow.Date.AddDays(20).ToString("o"),
            endDate    = DateTime.UtcNow.Date.AddDays(25).ToString("o"),
            totalDays  = 5,
            reason     = "Vacanze"
        });

        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // VAC-02 — EndDate < StartDate → 400
    [Fact]
    public async Task Create_EndDateBeforeStartDate_Returns400()
    {
        var empId = await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/vacation-requests", new
        {
            employeeId = empId,
            type       = "Holiday",
            startDate  = DateTime.UtcNow.Date.AddDays(25).ToString("o"),
            endDate    = DateTime.UtcNow.Date.AddDays(20).ToString("o"),
            totalDays  = 5,
            reason     = "Test"
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // VAC-04 / EDGE-05 — periodo > 365 giorni → 400
    [Fact]
    public async Task Create_PeriodOver365Days_Returns400()
    {
        var empId = await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.PostAsJsonAsync("/turnify/api/vacation-requests", new
        {
            employeeId = empId,
            type       = "Holiday",
            startDate  = DateTime.UtcNow.Date.ToString("o"),
            endDate    = DateTime.UtcNow.Date.AddDays(366).ToString("o"),
            totalDays  = 366,
            reason     = "Test"
        });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // EDGE-05 — periodo esattamente 365 giorni → 201
    [Fact]
    public async Task Create_Exactly365Days_Returns201()
    {
        var empId = await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var start = DateTime.UtcNow.Date.AddDays(400);
        var end   = start.AddDays(365);

        var res = await Client.PostAsJsonAsync("/turnify/api/vacation-requests", new
        {
            employeeId = empId,
            type       = "Holiday",
            startDate  = start.ToString("o"),
            endDate    = end.ToString("o"),
            totalDays  = 261,
            reason     = "Test"
        });

        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // VAC-10 — tutti i tipi ferie validi → 201 per ognuno
    [Theory]
    [InlineData("Holiday")]
    [InlineData("PaidLeave")]
    [InlineData("UnpaidLeave")]
    [InlineData("SickLeave")]
    public async Task Create_AllVacationTypes_Returns201(string type)
    {
        var empId = await SeedEmployeeAsync();
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var start = DateTime.UtcNow.Date.AddDays(50);
        var end   = start.AddDays(3);

        var res = await Client.PostAsJsonAsync("/turnify/api/vacation-requests", new
        {
            employeeId = empId,
            type,
            startDate  = start.ToString("o"),
            endDate    = end.ToString("o"),
            totalDays  = 3,
            reason     = "Test"
        });

        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // VAC-06 — admin approva richiesta → 200 status=Approved
    [Fact]
    public async Task Approve_PendingRequest_Returns200()
    {
        var empId = await SeedEmployeeAsync();
        var vrId  = await SeedVacationRequestAsync(empId);
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var res = await Client.PutAsJsonAsync($"/turnify/api/vacation-requests/{vrId}/approve",
            new { note = "" });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("status").GetString().Should().Be("Approved");
    }

    // VAC-07 — admin rifiuta richiesta → 200 status=Rejected
    [Fact]
    public async Task Reject_PendingRequest_Returns200()
    {
        var empId = await SeedEmployeeAsync();
        var vrId  = await SeedVacationRequestAsync(empId);
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var res = await Client.PutAsJsonAsync($"/turnify/api/vacation-requests/{vrId}/reject",
            new { note = "Periodo non disponibile" });

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("status").GetString().Should().Be("Rejected");
    }

    // VAC-09 — dipendente vede solo le proprie richieste
    [Fact]
    public async Task GetAll_AsEmployee_ReturnsOnlyOwnRequests()
    {
        const int otherEmployeeUserId = 302;

        var myEmpId    = await SeedEmployeeAsync(EmployeeUserId);
        var otherEmpId = await SeedEmployeeAsync(otherEmployeeUserId);

        await SeedVacationRequestAsync(myEmpId);
        await SeedVacationRequestAsync(otherEmpId);

        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);
        var res = await Client.GetAsync("/turnify/api/vacation-requests?pageSize=200");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<JsonElement[]>();
        list.Should().NotBeNull();

        // L'endpoint filtra per userId sul server — il dipendente vede solo le proprie
        list!.All(r => r.TryGetProperty("employeeId", out var eid) && eid.GetInt32() == myEmpId)
            .Should().BeTrue("il dipendente non deve vedere le ferie altrui");
    }

    // GET con filtro status=Pending
    [Fact]
    public async Task GetAll_WithStatusFilter_ReturnsOnlyMatchingStatus()
    {
        var empId = await SeedEmployeeAsync();
        await SeedVacationRequestAsync(empId, VacationRequestStatus.Pending);
        await SeedVacationRequestAsync(empId, VacationRequestStatus.Approved);

        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var res = await Client.GetAsync("/turnify/api/vacation-requests?pageSize=200&status=Pending");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<JsonElement[]>();
        list.Should().NotBeNull();
        list!.All(r => r.GetProperty("status").GetString() == "Pending").Should().BeTrue();
    }

    // DELETE — dipendente annulla richiesta Pending → 204
    [Fact]
    public async Task Delete_PendingRequest_AsEmployee_Returns204()
    {
        var empId = await SeedEmployeeAsync();
        var vrId  = await SeedVacationRequestAsync(empId);
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.DeleteAsync($"/turnify/api/vacation-requests/{vrId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // DELETE — dipendente non può annullare richiesta già Approved → 400
    [Fact]
    public async Task Delete_ApprovedRequest_AsEmployee_Returns400()
    {
        var empId = await SeedEmployeeAsync();
        var vrId  = await SeedVacationRequestAsync(empId, VacationRequestStatus.Approved);
        AuthenticateAs(EmployeeUserId, CompanyId, UserRole.Employee);

        var res = await Client.DeleteAsync($"/turnify/api/vacation-requests/{vrId}");

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
