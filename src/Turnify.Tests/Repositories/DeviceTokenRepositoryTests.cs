using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Repositories;
using Xunit;

namespace Turnify.Tests.Repositories;

public class DeviceTokenRepositoryTests
{
    private static TurnifyDbContext CreateContext(string dbName)
    {
        var opts = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TurnifyDbContext(opts);
    }

    // ── GetActiveByUserIdAsync ─────────────────────────────────────

    [Fact]
    public async Task GetActiveByUserIdAsync_ReturnsOnlyActiveTokensForUser()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.DeviceTokens.AddRange(
            new DeviceToken { UserId = 1, Token = "tok1", IsActive = true,  Platform = DevicePlatform.Android },
            new DeviceToken { UserId = 1, Token = "tok2", IsActive = false, Platform = DevicePlatform.Android }, // non attivo
            new DeviceToken { UserId = 2, Token = "tok3", IsActive = true,  Platform = DevicePlatform.iOS }      // altro utente
        );
        await ctx.SaveChangesAsync();
        var sut = new DeviceTokenRepository(ctx);

        var result = await sut.GetActiveByUserIdAsync(userId: 1);

        result.Should().HaveCount(1);
        result[0].Token.Should().Be("tok1");
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_NoTokens_ReturnsEmpty()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new DeviceTokenRepository(ctx);

        var result = await sut.GetActiveByUserIdAsync(userId: 99);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_MultipleActiveTokens_ReturnsAll()
    {
        // Un utente può avere più device (telefono + tablet)
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.DeviceTokens.AddRange(
            new DeviceToken { UserId = 1, Token = "tok-phone",  IsActive = true, Platform = DevicePlatform.Android },
            new DeviceToken { UserId = 1, Token = "tok-tablet", IsActive = true, Platform = DevicePlatform.Android }
        );
        await ctx.SaveChangesAsync();
        var sut = new DeviceTokenRepository(ctx);

        var result = await sut.GetActiveByUserIdAsync(userId: 1);

        result.Should().HaveCount(2);
    }

    // ── GetByTokenAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetByTokenAsync_ExistingToken_ReturnsDeviceToken()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.DeviceTokens.Add(new DeviceToken { UserId = 1, Token = "fcm-xyz", IsActive = true, Platform = DevicePlatform.Android });
        await ctx.SaveChangesAsync();
        var sut = new DeviceTokenRepository(ctx);

        var result = await sut.GetByTokenAsync("fcm-xyz");

        result.Should().NotBeNull();
        result!.Token.Should().Be("fcm-xyz");
    }

    [Fact]
    public async Task GetByTokenAsync_NonExistentToken_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new DeviceTokenRepository(ctx);

        var result = await sut.GetByTokenAsync("nonexistent");

        result.Should().BeNull();
    }

    // ── AddAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task AddAsync_PersistsToken()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new DeviceTokenRepository(ctx);
        var token = new DeviceToken { UserId = 1, Token = "new-fcm-token", IsActive = true, Platform = DevicePlatform.Android };

        var result = await sut.AddAsync(token);

        result.Should().NotBeNull();
        ctx.DeviceTokens.Should().HaveCount(1);
    }

    // ── DeactivateAsync ────────────────────────────────────────────

    [Fact]
    public async Task DeactivateAsync_ExistingToken_SetsIsActiveFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.DeviceTokens.Add(new DeviceToken { UserId = 1, Token = "tok-active", IsActive = true, Platform = DevicePlatform.Android });
        await ctx.SaveChangesAsync();
        var sut = new DeviceTokenRepository(ctx);

        await sut.DeactivateAsync("tok-active");

        var updated = await ctx.DeviceTokens.FirstAsync();
        updated.IsActive.Should().BeFalse();
        updated.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task DeactivateAsync_NonExistentToken_DoesNotThrow()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new DeviceTokenRepository(ctx);

        var act = async () => await sut.DeactivateAsync("nonexistent");

        await act.Should().NotThrowAsync();
    }

    // ── UpdateAsync ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAt()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var token = new DeviceToken
        {
            UserId    = 1,
            Token     = "tok",
            IsActive  = true,
            Platform  = DevicePlatform.Android,
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        ctx.DeviceTokens.Add(token);
        await ctx.SaveChangesAsync();
        var sut    = new DeviceTokenRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        await sut.UpdateAsync(token);

        var updated = await ctx.DeviceTokens.FirstAsync();
        updated.UpdatedAt.Should().BeAfter(before);
    }
}
