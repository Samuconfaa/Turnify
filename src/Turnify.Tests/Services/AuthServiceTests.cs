using System;
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

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ICompanyRepository> _companyRepositoryMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly AuthService _sut; // System Under Test

    public AuthServiceTests()
    {
        _userRepositoryMock    = new Mock<IUserRepository>();
        _companyRepositoryMock = new Mock<ICompanyRepository>();
        _configMock            = new Mock<IConfiguration>();
        _emailServiceMock      = new Mock<IEmailService>();

        // Setup mock config for JWT
        _configMock.Setup(c => c["Jwt:Secret"]).Returns("SuperSecretKeyForTestingPurposeOnly123!");
        _configMock.Setup(c => c["Jwt:Issuer"]).Returns("TurnifyTest");
        _configMock.Setup(c => c["Jwt:Audience"]).Returns("TurnifyTestUsers");

        var configSectionMock1 = new Mock<IConfigurationSection>();
        configSectionMock1.Setup(c => c.Value).Returns("15");
        _configMock.Setup(c => c.GetSection("Jwt:AccessTokenExpiryMinutes")).Returns(configSectionMock1.Object);

        var configSectionMock2 = new Mock<IConfigurationSection>();
        configSectionMock2.Setup(c => c.Value).Returns("7");
        _configMock.Setup(c => c.GetSection("Jwt:RefreshTokenExpiryDays")).Returns(configSectionMock2.Object);

        _sut = new AuthService(
            _userRepositoryMock.Object,
            _companyRepositoryMock.Object,
            _configMock.Object,
            _emailServiceMock.Object);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var email = "test@example.com";
        var password = "password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
        
        var user = new User
        {
            Id = 1,
            Email = email,
            PasswordHash = hashedPassword,
            IsActive = true,
            Role = UserRole.Employee,
            CompanyId = 1
        };

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.LoginAsync(email, password);

        // Assert
        result.Should().NotBeNull();
        result.Value.AccessToken.Should().NotBeNullOrEmpty();
        result.Value.RefreshToken.Should().NotBeNullOrEmpty();
        
        _userRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsNull()
    {
        // Arrange
        var email = "test@example.com";
        var password = "wrong_password";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("correct_password");
        
        var user = new User
        {
            Id = 1,
            Email = email,
            PasswordHash = hashedPassword,
            IsActive = true
        };

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.LoginAsync(email, password);

        // Assert
        result.Should().BeNull();
        _userRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_UnknownEmail_ReturnsNull()
    {
        // Arrange
        var email = "unknown@example.com";

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _sut.LoginAsync(email, "any_password");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RegisterCompanyAsync_ValidData_CreatesCompanyAndAdmin()
    {
        // Arrange
        var company = new Company { Slug = "new-company" };
        var adminUser = new User { Email = "admin@newcompany.com", PasswordHash = "password123" };

        _companyRepositoryMock
            .Setup(repo => repo.ExistsBySlugAsync(company.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _userRepositoryMock
            .Setup(repo => repo.ExistsByEmailAsync(adminUser.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var createdCompany = new Company { Id = 1, Slug = "new-company" };
        _companyRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdCompany);

        // Act
        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        // Assert
        result.Should().BeTrue();
        _companyRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Once);
        _userRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterCompanyAsync_DuplicateEmail_ReturnsFalse()
    {
        // Arrange
        var company = new Company { Slug = "new-company" };
        var adminUser = new User { Email = "existing@example.com" };

        _companyRepositoryMock
            .Setup(repo => repo.ExistsBySlugAsync(company.Slug, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _userRepositoryMock
            .Setup(repo => repo.ExistsByEmailAsync(adminUser.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.RegisterCompanyAsync(company, adminUser);

        // Assert
        result.Should().BeFalse();
        _companyRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Never);
        _userRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
