using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Services;
using Xunit;

namespace Turnify.Tests.Services;

/// <summary>
/// Test unitari per EmployeeLoginAsync e per i casi edge di RegisterCompanyAsync
/// introdotti dal fix email nullable (maggio 2026).
/// </summary>
public class AuthServiceEmployeeLoginTests
{
    private readonly Mock<IUserRepository>    _userRepo;
    private readonly Mock<ICompanyRepository> _companyRepo;
    private readonly AuthService              _sut;

    public AuthServiceEmployeeLoginTests()
    {
        _userRepo    = new Mock<IUserRepository>();
        _companyRepo = new Mock<ICompanyRepository>();
        var emailSvc = new Mock<IEmailService>();

        var cfg = new Mock<IConfiguration>();
        cfg.Setup(c => c["Jwt:Secret"]).Returns("SuperSecretKeyForTestingPurposeOnly123!");
        cfg.Setup(c => c["Jwt:Issuer"]).Returns("TurnifyTest");
        cfg.Setup(c => c["Jwt:Audience"]).Returns("TurnifyTestUsers");

        var section1 = new Mock<IConfigurationSection>();
        section1.Setup(s => s.Value).Returns("15");
        cfg.Setup(c => c.GetSection("Jwt:AccessTokenExpiryMinutes")).Returns(section1.Object);

        var section2 = new Mock<IConfigurationSection>();
        section2.Setup(s => s.Value).Returns("7");
        cfg.Setup(c => c.GetSection("Jwt:RefreshTokenExpiryDays")).Returns(section2.Object);

        _sut = new AuthService(_userRepo.Object, _companyRepo.Object, cfg.Object, emailSvc.Object);
    }

    // ── EmployeeLoginAsync ───────────────────────────────────────────

    // AUTH-EMP-01 — credenziali corrette → restituisce token
    [Fact]
    public async Task EmployeeLoginAsync_ValidCredentials_ReturnsTokens()
    {
        var password = "Password1!";
        var company  = new Company { Id = 10, Slug = "my-company" };
        var user     = new User
        {
            Id           = 5,
            Username     = "mario",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role         = UserRole.Employee,
            CompanyId    = 10,
            IsActive     = true
        };

        _companyRepo.Setup(r => r.GetBySlugAsync("my-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(company);
        _userRepo.Setup(r => r.GetByUsernameInCompanyAsync("mario", 10, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                 .ReturnsAsync((User u, CancellationToken _) => u);

        var result = await _sut.EmployeeLoginAsync("my-company", "mario", password);

        result.Should().NotBeNull();
        result!.Value.AccessToken.Should().NotBeNullOrEmpty();
        result.Value.RefreshToken.Should().NotBeNullOrEmpty();
    }

    // AUTH-EMP-02 — password errata → null
    [Fact]
    public async Task EmployeeLoginAsync_WrongPassword_ReturnsNull()
    {
        var company = new Company { Id = 10, Slug = "my-company" };
        var user    = new User
        {
            Id           = 5,
            Username     = "mario",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword1!"),
            Role         = UserRole.Employee,
            CompanyId    = 10,
            IsActive     = true
        };

        _companyRepo.Setup(r => r.GetBySlugAsync("my-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(company);
        _userRepo.Setup(r => r.GetByUsernameInCompanyAsync("mario", 10, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(user);

        var result = await _sut.EmployeeLoginAsync("my-company", "mario", "WrongPassword1!");

        result.Should().BeNull();
        _userRepo.Verify(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // AUTH-EMP-03 — slug azienda non esistente → null
    [Fact]
    public async Task EmployeeLoginAsync_UnknownCompanySlug_ReturnsNull()
    {
        _companyRepo.Setup(r => r.GetBySlugAsync("unknown-co", It.IsAny<CancellationToken>()))
                    .ReturnsAsync((Company?)null);

        var result = await _sut.EmployeeLoginAsync("unknown-co", "mario", "Password1!");

        result.Should().BeNull();
        _userRepo.Verify(r => r.GetByUsernameInCompanyAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // AUTH-EMP-04 — username non trovato in quella azienda → null
    [Fact]
    public async Task EmployeeLoginAsync_UnknownUsername_ReturnsNull()
    {
        var company = new Company { Id = 10, Slug = "my-company" };

        _companyRepo.Setup(r => r.GetBySlugAsync("my-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(company);
        _userRepo.Setup(r => r.GetByUsernameInCompanyAsync("nessuno", 10, It.IsAny<CancellationToken>()))
                 .ReturnsAsync((User?)null);

        var result = await _sut.EmployeeLoginAsync("my-company", "nessuno", "Password1!");

        result.Should().BeNull();
    }

    // AUTH-EMP-05 — utente disattivato → null
    [Fact]
    public async Task EmployeeLoginAsync_InactiveUser_ReturnsNull()
    {
        var company = new Company { Id = 10, Slug = "my-company" };
        var user    = new User
        {
            Id           = 5,
            Username     = "mario",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
            Role         = UserRole.Employee,
            CompanyId    = 10,
            IsActive     = false   // disattivato
        };

        _companyRepo.Setup(r => r.GetBySlugAsync("my-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(company);
        _userRepo.Setup(r => r.GetByUsernameInCompanyAsync("mario", 10, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(user);

        var result = await _sut.EmployeeLoginAsync("my-company", "mario", "Password1!");

        result.Should().BeNull();
    }

    // AUTH-EMP-06 — admin tenta di accedere come dipendente → null (blocco esplicito per ruolo Admin)
    [Fact]
    public async Task EmployeeLoginAsync_AdminRole_ReturnsNull()
    {
        var company = new Company { Id = 10, Slug = "my-company" };
        var admin   = new User
        {
            Id           = 1,
            Username     = "boss",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
            Role         = UserRole.Admin,   // Admin non può fare employee-login
            CompanyId    = 10,
            IsActive     = true
        };

        _companyRepo.Setup(r => r.GetBySlugAsync("my-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(company);
        _userRepo.Setup(r => r.GetByUsernameInCompanyAsync("boss", 10, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(admin);

        var result = await _sut.EmployeeLoginAsync("my-company", "boss", "Password1!");

        result.Should().BeNull("un Admin non deve poter accedere tramite employee-login");
        _userRepo.Verify(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ── RegisterCompanyAsync — email nullable fix ────────────────────

    // REG-NULL-01 — adminUser.Email null → non viene chiamato ExistsByEmailAsync
    [Fact]
    public async Task RegisterCompanyAsync_NullAdminEmail_SkipsEmailExistenceCheck()
    {
        var company   = new Company { Slug = "new-company" };
        var adminUser = new User { Email = null, PasswordHash = "password" };

        _companyRepo.Setup(r => r.ExistsBySlugAsync("new-company", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(false);
        _companyRepo.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new Company { Id = 1, Slug = "new-company" });

        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        result.Should().BeTrue();
        _userRepo.Verify(r => r.ExistsByEmailAsync(
            It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never,
            "ExistsByEmailAsync non deve essere invocato quando l'email è null");
        _userRepo.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // REG-NULL-02 — adminUser.Email stringa vuota → non viene chiamato ExistsByEmailAsync
    [Fact]
    public async Task RegisterCompanyAsync_EmptyAdminEmail_SkipsEmailExistenceCheck()
    {
        var company   = new Company { Slug = "new-co-empty-email" };
        var adminUser = new User { Email = string.Empty, PasswordHash = "password" };

        _companyRepo.Setup(r => r.ExistsBySlugAsync("new-co-empty-email", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(false);
        _companyRepo.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new Company { Id = 2, Slug = "new-co-empty-email" });

        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        result.Should().BeTrue();
        _userRepo.Verify(r => r.ExistsByEmailAsync(
            It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // REG-NULL-03 — adminUser.Email whitespace → non viene chiamato ExistsByEmailAsync
    [Fact]
    public async Task RegisterCompanyAsync_WhitespaceAdminEmail_SkipsEmailExistenceCheck()
    {
        var company   = new Company { Slug = "new-co-ws-email" };
        var adminUser = new User { Email = "   ", PasswordHash = "password" };

        _companyRepo.Setup(r => r.ExistsBySlugAsync("new-co-ws-email", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(false);
        _companyRepo.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new Company { Id = 3, Slug = "new-co-ws-email" });

        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        result.Should().BeTrue();
        _userRepo.Verify(r => r.ExistsByEmailAsync(
            It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // REG-NULL-04 — adminUser.Email valorizzato → ExistsByEmailAsync DEVE essere chiamato
    [Fact]
    public async Task RegisterCompanyAsync_ValidAdminEmail_ChecksEmailExistence()
    {
        var company   = new Company { Slug = "new-co-with-email" };
        var adminUser = new User { Email = "admin@company.it", PasswordHash = "password" };

        _companyRepo.Setup(r => r.ExistsBySlugAsync("new-co-with-email", It.IsAny<CancellationToken>()))
                    .ReturnsAsync(false);
        _userRepo.Setup(r => r.ExistsByEmailAsync("admin@company.it", It.IsAny<CancellationToken>()))
                 .ReturnsAsync(false);
        _companyRepo.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new Company { Id = 4, Slug = "new-co-with-email" });

        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        result.Should().BeTrue();
        _userRepo.Verify(r => r.ExistsByEmailAsync("admin@company.it", It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── LoginAsync — utente disattivato ──────────────────────────────

    // AUTH-INACTIVE — login con utente disattivato → null
    [Fact]
    public async Task LoginAsync_InactiveUser_ReturnsNull()
    {
        var email = "inactive@example.com";
        var user  = new User
        {
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
            IsActive     = false,
            Role         = UserRole.Admin,
            CompanyId    = 1
        };

        _userRepo.Setup(r => r.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(user);

        var result = await _sut.LoginAsync(email, "Password1!");

        result.Should().BeNull();
    }

    // ── LogoutAsync ──────────────────────────────────────────────────

    // LOGOUT-01 — logout utente esistente azzera il refresh token
    [Fact]
    public async Task LogoutAsync_ExistingUser_ClearsRefreshToken()
    {
        var user = new User
        {
            Id               = 7,
            RefreshTokenHash = "some-hash",
            RefreshTokenExpiryTime = System.DateTime.UtcNow.AddDays(7),
            CompanyId        = 1,
            IsActive         = true
        };

        _userRepo.Setup(r => r.GetByIdAsync(7, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                 .ReturnsAsync((User u, CancellationToken _) => u);

        var result = await _sut.LogoutAsync(7);

        result.Should().BeTrue();
        user.RefreshTokenHash.Should().BeNull();
        user.RefreshTokenExpiryTime.Should().BeNull();
        _userRepo.Verify(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()), Times.Once);
    }

    // LOGOUT-02 — logout utente non trovato → false
    [Fact]
    public async Task LogoutAsync_UnknownUser_ReturnsFalse()
    {
        _userRepo.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                 .ReturnsAsync((User?)null);

        var result = await _sut.LogoutAsync(999);

        result.Should().BeFalse();
        _userRepo.Verify(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
