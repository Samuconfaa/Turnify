using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;

namespace Turnify.Tests.Integration;

/// <summary>
/// Integration test per il fix email nullable su Employee (maggio 2026).
/// Verifica che:
/// - più dipendenti senza email nella stessa azienda vengano creati senza errori
/// - l'email duplicata nella stessa azienda venga rifiutata
/// - l'email vuota venga salvata come null
/// - l'update a email null funzioni correttamente
/// </summary>
public class EmployeesControllerEmailTests : IntegrationTestBase
{
    private const int CompanyId = 50;
    private const int AdminId   = 500;

    public EmployeesControllerEmailTests(TurnifyWebFactory factory) : base(factory) { }

    private object BuildCreateRequest(string username, string? email = null) => new
    {
        firstName    = "Test",
        lastName     = "User",
        username,
        email,
        phone        = "",
        role         = "Cassiere",
        accountRole  = "Employee",
        contractType = "FullTime",
        weeklyHours  = 40m,
        businessId   = (int?)null,
        password     = "Password1!"
    };

    // EMP-07 — due dipendenti senza email nella stessa azienda → entrambi 201
    [Fact]
    public async Task CreateEmployee_MultipleWithNullEmail_AllReturn201()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var res1 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"user_a_{Guid.NewGuid():N}".Substring(0, 20)));
        var res2 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"user_b_{Guid.NewGuid():N}".Substring(0, 20)));

        res1.StatusCode.Should().Be(HttpStatusCode.Created,
            "il primo dipendente senza email deve essere creato correttamente");
        res2.StatusCode.Should().Be(HttpStatusCode.Created,
            "il secondo dipendente senza email non deve violare il vincolo unico");
    }

    // EMP-08 — cinque dipendenti senza email nella stessa azienda → tutti 201
    [Fact]
    public async Task CreateEmployee_FiveWithNullEmail_AllReturn201()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        for (var i = 0; i < 5; i++)
        {
            var res = await Client.PostAsJsonAsync("/turnify/api/employees",
                BuildCreateRequest($"bulk_{Guid.NewGuid():N}".Substring(0, 20)));
            res.StatusCode.Should().Be(HttpStatusCode.Created,
                $"il dipendente {i + 1} senza email deve essere creato senza errori");
        }
    }

    // EMP-09 — email duplicata nella stessa azienda → 400
    [Fact]
    public async Task CreateEmployee_DuplicateEmailSameCompany_Returns400()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var sharedEmail = $"dup_{Guid.NewGuid()}@test.it";

        // Primo dipendente con quell'email
        var res1 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"emp_dup1_{Guid.NewGuid():N}".Substring(0, 20), sharedEmail));
        res1.StatusCode.Should().Be(HttpStatusCode.Created);

        // Secondo dipendente con la stessa email → deve fallire
        var res2 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"emp_dup2_{Guid.NewGuid():N}".Substring(0, 20), sharedEmail));
        res2.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "non si può avere la stessa email per due dipendenti della stessa azienda");
    }

    // EMP-10 — stessa email su aziende diverse → entrambi 201 (non c'è vincolo cross-azienda)
    [Fact]
    public async Task CreateEmployee_SameEmailDifferentCompanies_BothReturn201()
    {
        const int CompanyX = 51;
        const int AdminX   = 510;
        const int CompanyY = 52;
        const int AdminY   = 520;
        var sharedEmail = $"cross_{Guid.NewGuid()}@test.it";

        // Azienda X
        AuthenticateAs(AdminX, CompanyX, UserRole.Admin);
        var resX = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"x_{Guid.NewGuid():N}".Substring(0, 20), sharedEmail));
        resX.StatusCode.Should().Be(HttpStatusCode.Created);

        // Azienda Y — stessa email ma azienda diversa → deve riuscire
        AuthenticateAs(AdminY, CompanyY, UserRole.Admin);
        var resY = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"y_{Guid.NewGuid():N}".Substring(0, 20), sharedEmail));
        resY.StatusCode.Should().Be(HttpStatusCode.Created,
            "la stessa email è ammessa in aziende diverse");
    }

    // EMP-11 — email vuota nel body → salvata come null (campo email del DTO è null nel response)
    [Fact]
    public async Task CreateEmployee_EmptyEmail_StoredAsNull()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var res = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"no_email_{Guid.NewGuid():N}".Substring(0, 20), email: ""));
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        // Il DTO restituisce null quando email è stringa vuota o null
        var emailProp = body.GetProperty("email");
        (emailProp.ValueKind == JsonValueKind.Null || string.IsNullOrEmpty(emailProp.GetString()))
            .Should().BeTrue("l'email vuota deve essere salvata come null");
    }

    // EMP-12 — update dipendente: imposta email a null → 200, email rimossa
    [Fact]
    public async Task UpdateEmployee_SetEmailToNull_Returns200AndRemovesEmail()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        // Crea dipendente con email
        var email    = $"update_null_{Guid.NewGuid()}@test.it";
        var username = $"upd_{Guid.NewGuid():N}".Substring(0, 20);
        var createRes = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest(username, email));
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var empId   = created.GetProperty("id").GetInt32();

        // Aggiorna rimuovendo l'email
        var updateRes = await Client.PutAsJsonAsync($"/turnify/api/employees/{empId}", new
        {
            firstName    = "Test",
            lastName     = "User",
            email        = (string?)null,
            phone        = "",
            role         = "Cassiere",
            contractType = "FullTime",
            weeklyHours  = 40m,
            isActive     = true
        });

        updateRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await updateRes.Content.ReadFromJsonAsync<JsonElement>();
        var updatedEmail = updated.GetProperty("email");
        (updatedEmail.ValueKind == JsonValueKind.Null || string.IsNullOrEmpty(updatedEmail.GetString()))
            .Should().BeTrue("dopo l'update l'email deve essere null");
    }

    // EMP-13 — dipendente con email null, poi secondo con stessa email non-null → OK (solo il vincolo unico su non-null)
    [Fact]
    public async Task CreateEmployee_NullThenWithEmail_BothReturn201()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);
        var email = $"after_null_{Guid.NewGuid()}@test.it";

        // Prima crea uno senza email
        var res1 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"before_null_{Guid.NewGuid():N}".Substring(0, 20)));
        res1.StatusCode.Should().Be(HttpStatusCode.Created);

        // Poi uno con email → non deve essere bloccato dall'indice filtrato
        var res2 = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest($"after_null_{Guid.NewGuid():N}".Substring(0, 20), email));
        res2.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // EMP-14 — reset password dipendente → 204
    [Fact]
    public async Task ResetEmployeePassword_AsAdmin_Returns204()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        // Crea dipendente
        var username  = $"pwdreset_{Guid.NewGuid():N}".Substring(0, 20);
        var createRes = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest(username));
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var empId   = created.GetProperty("id").GetInt32();

        // Reset password con password valida
        var res = await Client.PutAsJsonAsync($"/turnify/api/employees/{empId}/password",
            new { newPassword = "NewPassword1!" });

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // EMP-15 — reset password con password debole → 400
    [Fact]
    public async Task ResetEmployeePassword_WeakPassword_Returns400()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var username  = $"pwdweak_{Guid.NewGuid():N}".Substring(0, 20);
        var createRes = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest(username));
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var empId   = created.GetProperty("id").GetInt32();

        var res = await Client.PutAsJsonAsync($"/turnify/api/employees/{empId}/password",
            new { newPassword = "weak" });

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // EMP-16 — dipendente non può resettare password di altri → 403
    [Fact]
    public async Task ResetEmployeePassword_AsEmployee_Returns403()
    {
        const int EmployeeId = 501;
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var username  = $"target_{Guid.NewGuid():N}".Substring(0, 20);
        var createRes = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest(username));
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var empId   = created.GetProperty("id").GetInt32();

        // Ora tenta come dipendente
        AuthenticateAs(EmployeeId, CompanyId, UserRole.Employee);
        var res = await Client.PutAsJsonAsync($"/turnify/api/employees/{empId}/password",
            new { newPassword = "NewPassword1!" });

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // EMP-17 — disponibilità admin GET per ID specifico → 200
    [Fact]
    public async Task GetAvailabilityById_AsAdmin_Returns200()
    {
        AuthenticateAs(AdminId, CompanyId, UserRole.Admin);

        var username  = $"avail_{Guid.NewGuid():N}".Substring(0, 20);
        var createRes = await Client.PostAsJsonAsync("/turnify/api/employees",
            BuildCreateRequest(username));
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var empId   = created.GetProperty("id").GetInt32();

        var res = await Client.GetAsync($"/turnify/api/employees/{empId}/availability");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("availableDays").ValueKind.Should().NotBe(JsonValueKind.Undefined);
    }
}
