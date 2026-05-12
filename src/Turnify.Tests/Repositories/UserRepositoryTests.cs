using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Repositories;
using Xunit;

namespace Turnify.Tests.Repositories;

public class UserRepositoryTests
{
    private static TurnifyDbContext CreateContext(string dbName)
    {
        var opts = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TurnifyDbContext(opts);
    }

    // ── GetByIdAsync ───────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsUser()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.Add(new User { Id = 5, Email = "test@t.it", PasswordHash = "h", CompanyId = 1 });
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.GetByIdAsync(5);

        result.Should().NotBeNull();
        result!.Id.Should().Be(5);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentId_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new UserRepository(ctx);

        var result = await sut.GetByIdAsync(999);

        result.Should().BeNull();
    }

    // ── GetByEmailAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetByEmailAsync_ExistingEmail_ReturnsUser()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.Add(new User { Id = 1, Email = "mario@t.it", PasswordHash = "h", CompanyId = 1 });
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.GetByEmailAsync("mario@t.it");

        result.Should().NotBeNull();
        result!.Email.Should().Be("mario@t.it");
    }

    [Fact]
    public async Task GetByEmailAsync_NonExistingEmail_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new UserRepository(ctx);

        var result = await sut.GetByEmailAsync("missing@t.it");

        result.Should().BeNull();
    }

    // ── ExistsByEmailAsync ─────────────────────────────────────────

    [Fact]
    public async Task ExistsByEmailAsync_ExistingEmail_ReturnsTrue()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.Add(new User { Id = 1, Email = "exists@t.it", PasswordHash = "h", CompanyId = 1 });
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.ExistsByEmailAsync("exists@t.it");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsByEmailAsync_NonExistingEmail_ReturnsFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new UserRepository(ctx);

        var result = await sut.ExistsByEmailAsync("missing@t.it");

        result.Should().BeFalse();
    }

    // ── AddAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task AddAsync_PersistsUserAndSetsTimestamps()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut    = new UserRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        var user = new User { Email = "new@t.it", PasswordHash = "hash", CompanyId = 1 };
        var result = await sut.AddAsync(user);

        result.CreatedAt.Should().BeAfter(before);
        result.UpdatedAt.Should().BeAfter(before);
        ctx.Users.Should().HaveCount(1);
    }

    // ── UpdateAsync ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAt()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var user = new User
        {
            Id = 1, Email = "u@t.it", PasswordHash = "h", CompanyId = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();
        var sut    = new UserRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        user.IsActive = false;
        await sut.UpdateAsync(user);

        var updated = await ctx.Users.FirstAsync();
        updated.UpdatedAt.Should().BeAfter(before);
        updated.IsActive.Should().BeFalse();
    }

    // ── GetActiveUsersWithValidRefreshTokenAsync ───────────────────

    [Fact]
    public async Task GetActiveUsersWithValidRefreshTokenAsync_ReturnsOnlyValidUsers()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.AddRange(
            new User { Id = 1, Email = "a@t.it", PasswordHash = "h", CompanyId = 1, IsActive = true,  RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1) },   // valido
            new User { Id = 2, Email = "b@t.it", PasswordHash = "h", CompanyId = 1, IsActive = false, RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1) },   // non attivo
            new User { Id = 3, Email = "c@t.it", PasswordHash = "h", CompanyId = 1, IsActive = true,  RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1) }   // token scaduto
        );
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.GetActiveUsersWithValidRefreshTokenAsync();

        result.Should().HaveCount(1);
        result[0].Id.Should().Be(1);
    }

    [Fact]
    public async Task GetActiveUsersWithValidRefreshTokenAsync_NoneValid_ReturnsEmpty()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.Add(new User { Id = 1, Email = "a@t.it", PasswordHash = "h", CompanyId = 1, IsActive = false, RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1) });
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.GetActiveUsersWithValidRefreshTokenAsync();

        result.Should().BeEmpty();
    }

    // ── GetUsersWithValidResetTokenAsync ──────────────────────────

    [Fact]
    public async Task GetUsersWithValidResetTokenAsync_ReturnsOnlyUsersWithValidToken()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Users.AddRange(
            new User { Id = 1, Email = "a@t.it", PasswordHash = "h", CompanyId = 1, PasswordResetToken = "tok1", PasswordResetTokenExpiryTime = DateTime.UtcNow.AddHours(1)  },  // valido
            new User { Id = 2, Email = "b@t.it", PasswordHash = "h", CompanyId = 1, PasswordResetToken = null },                                                                  // nessun token
            new User { Id = 3, Email = "c@t.it", PasswordHash = "h", CompanyId = 1, PasswordResetToken = "tok3", PasswordResetTokenExpiryTime = DateTime.UtcNow.AddHours(-1) }   // scaduto
        );
        await ctx.SaveChangesAsync();
        var sut = new UserRepository(ctx);

        var result = await sut.GetUsersWithValidResetTokenAsync();

        result.Should().HaveCount(1);
        result[0].Id.Should().Be(1);
    }
}
