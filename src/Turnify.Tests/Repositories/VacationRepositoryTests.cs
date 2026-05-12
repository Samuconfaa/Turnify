using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Repositories;
using Xunit;

namespace Turnify.Tests.Repositories;

public class VacationRepositoryTests
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
    public async Task GetByIdAsync_ExistingId_ReturnsRequest()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.VacationRequests.Add(new VacationRequest
        {
            Id = 1, CompanyId = 1, EmployeeId = 1,
            StartDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate   = new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc),
            Status    = VacationRequestStatus.Pending
        });
        await ctx.SaveChangesAsync();
        var sut = new VacationRepository(ctx);

        var result = await sut.GetByIdAsync(1);

        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentId_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new VacationRepository(ctx);

        var result = await sut.GetByIdAsync(999);

        result.Should().BeNull();
    }

    // ── GetByCompanyAsync ──────────────────────────────────────────

    [Fact]
    public async Task GetByCompanyAsync_FiltersCorrectly()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.VacationRequests.AddRange(
            new VacationRequest { CompanyId = 1, EmployeeId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(3) },
            new VacationRequest { CompanyId = 1, EmployeeId = 2, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(2) },
            new VacationRequest { CompanyId = 2, EmployeeId = 3, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(1) }
        );
        await ctx.SaveChangesAsync();
        var sut = new VacationRepository(ctx);

        var result = await sut.GetByCompanyAsync(companyId: 1);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(v => v.CompanyId == 1);
    }

    [Fact]
    public async Task GetByCompanyAsync_EmptyDb_ReturnsEmpty()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new VacationRepository(ctx);

        var result = await sut.GetByCompanyAsync(companyId: 1);

        result.Should().BeEmpty();
    }

    // ── GetByEmployeeAsync ─────────────────────────────────────────

    [Fact]
    public async Task GetByEmployeeAsync_FiltersCorrectly()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.VacationRequests.AddRange(
            new VacationRequest { CompanyId = 1, EmployeeId = 1, StartDate = DateTime.UtcNow,           EndDate = DateTime.UtcNow.AddDays(3) },
            new VacationRequest { CompanyId = 1, EmployeeId = 1, StartDate = DateTime.UtcNow.AddDays(10), EndDate = DateTime.UtcNow.AddDays(12) },
            new VacationRequest { CompanyId = 1, EmployeeId = 2, StartDate = DateTime.UtcNow,           EndDate = DateTime.UtcNow.AddDays(2) }
        );
        await ctx.SaveChangesAsync();
        var sut = new VacationRepository(ctx);

        var result = await sut.GetByEmployeeAsync(employeeId: 1);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(v => v.EmployeeId == 1);
    }

    // ── AddAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task AddAsync_PersistsRequestAndSetsTimestamps()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut    = new VacationRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        var request = new VacationRequest
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartDate  = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate    = new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc),
            Status     = VacationRequestStatus.Pending
        };

        var result = await sut.AddAsync(request);

        result.CreatedAt.Should().BeAfter(before);
        result.UpdatedAt.Should().BeAfter(before);
        ctx.VacationRequests.Should().HaveCount(1);
    }

    // ── UpdateAsync ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtAndPersistsChanges()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var request = new VacationRequest
        {
            Id         = 1,
            CompanyId  = 1,
            EmployeeId = 1,
            StartDate  = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate    = new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc),
            Status     = VacationRequestStatus.Pending,
            CreatedAt  = DateTime.UtcNow.AddDays(-1),
            UpdatedAt  = DateTime.UtcNow.AddDays(-1)
        };
        ctx.VacationRequests.Add(request);
        await ctx.SaveChangesAsync();
        var sut    = new VacationRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        request.Status = VacationRequestStatus.Approved;
        await sut.UpdateAsync(request);

        var updated = await ctx.VacationRequests.FirstAsync();
        updated.Status.Should().Be(VacationRequestStatus.Approved);
        updated.UpdatedAt.Should().BeAfter(before);
    }

    // ── DeleteAsync ────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ExistingRequest_RemovesFromDb()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.VacationRequests.Add(new VacationRequest
        {
            Id = 1, CompanyId = 1, EmployeeId = 1,
            StartDate = DateTime.UtcNow,
            EndDate   = DateTime.UtcNow.AddDays(3)
        });
        await ctx.SaveChangesAsync();
        var sut = new VacationRepository(ctx);

        var result = await sut.DeleteAsync(1);

        result.Should().BeTrue();
        ctx.VacationRequests.Should().HaveCount(0);
    }

    [Fact]
    public async Task DeleteAsync_NonExistentRequest_ReturnsFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new VacationRepository(ctx);

        var result = await sut.DeleteAsync(999);

        result.Should().BeFalse();
    }
}
