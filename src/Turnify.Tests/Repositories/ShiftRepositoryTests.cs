using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Repositories;
using Xunit;

namespace Turnify.Tests.Repositories;

public class ShiftRepositoryTests
{
    private static TurnifyDbContext CreateContext(string dbName)
    {
        var opts = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TurnifyDbContext(opts);
    }

    // ── HasOverlapAsync ────────────────────────────────────────────

    [Fact]
    public async Task HasOverlapAsync_NoExistingShifts_ReturnsFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new ShiftRepository(ctx);

        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasOverlapAsync_ExactOverlap_ReturnsTrue()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasOverlapAsync_PartialOverlapAtStart_ReturnsTrue()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        // Nuovo turno che inizia prima e finisce nel mezzo del turno esistente
        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 7,  0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 12, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasOverlapAsync_PartialOverlapAtEnd_ReturnsTrue()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        // Nuovo turno che inizia nel mezzo e finisce dopo il turno esistente
        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 14, 0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 22, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasOverlapAsync_AdjacentShiftsNotOverlapping_ReturnsFalse()
    {
        // Turno 9-13. Nuovo turno 13-17: adiacenti, non sovrapposti (end = start è escluso)
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 13, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 13, 0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasOverlapAsync_WithExcludeId_IgnoresOwnShift()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            Id         = 1,
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        // Stessa finestra temporale ma escludo il turno stesso (scenario update)
        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            excludeShiftId: 1);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasOverlapAsync_DifferentEmployee_ReturnsFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            CompanyId  = 1,
            EmployeeId = 2, // dipendente diverso
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.HasOverlapAsync(
            employeeId: 1,
            start: new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            end:   new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            excludeShiftId: null);

        result.Should().BeFalse();
    }

    // ── GetByCompanyAsync ──────────────────────────────────────────

    [Fact]
    public async Task GetByCompanyAsync_FiltersCompanyAndRange()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 2, 9,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 2,  17, 0, 0, DateTimeKind.Utc) }, // in range
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 9, 9,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 9,  17, 0, 0, DateTimeKind.Utc) }, // fuori range (EndTime > to)
            new Shift { CompanyId = 2, EmployeeId = 2, StartTime = new DateTime(2026, 6, 3, 9,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 3,  17, 0, 0, DateTimeKind.Utc) }  // altra company
        );
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.GetByCompanyAsync(companyId: 1, from, to);

        result.Should().HaveCount(1);
        result[0].CompanyId.Should().Be(1);
    }

    [Fact]
    public async Task GetByCompanyAsync_EmptyDb_ReturnsEmpty()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new ShiftRepository(ctx);

        var result = await sut.GetByCompanyAsync(1,
            new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc));

        result.Should().BeEmpty();
    }

    // ── GetByEmployeeAsync ─────────────────────────────────────────

    [Fact]
    public async Task GetByEmployeeAsync_FiltersCorrectly()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 5, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 5, 17, 0, 0, DateTimeKind.Utc) },
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 6, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 6, 17, 0, 0, DateTimeKind.Utc) },
            new Shift { CompanyId = 1, EmployeeId = 2, StartTime = new DateTime(2026, 6, 5, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 5, 17, 0, 0, DateTimeKind.Utc) }
        );
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.GetByEmployeeAsync(employeeId: 1, from, to);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.EmployeeId == 1);
    }

    // ── AddAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task AddAsync_PersistsShiftAndSetsTimestamps()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut    = new ShiftRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        var shift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };

        var result = await sut.AddAsync(shift);

        result.CreatedAt.Should().BeAfter(before);
        result.UpdatedAt.Should().BeAfter(before);
        ctx.Shifts.Should().HaveCount(1);
    }

    // ── UpdateAsync ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesUpdatedAt()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var shift = new Shift
        {
            Id         = 1,
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc),
            CreatedAt  = DateTime.UtcNow.AddDays(-1),
            UpdatedAt  = DateTime.UtcNow.AddDays(-1)
        };
        ctx.Shifts.Add(shift);
        await ctx.SaveChangesAsync();
        var sut    = new ShiftRepository(ctx);
        var before = DateTime.UtcNow.AddSeconds(-1);

        shift.Label = "Turno modificato";
        await sut.UpdateAsync(shift);

        var updated = await ctx.Shifts.FirstAsync();
        updated.UpdatedAt.Should().BeAfter(before);
        updated.Label.Should().Be("Turno modificato");
    }

    // ── DeleteAsync ────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ExistingShift_RemovesFromDb()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            Id = 1, CompanyId = 1, EmployeeId = 1,
            StartTime = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime   = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.DeleteAsync(1);

        result.Should().BeTrue();
        ctx.Shifts.Should().HaveCount(0);
    }

    [Fact]
    public async Task DeleteAsync_NonExistentShift_ReturnsFalse()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new ShiftRepository(ctx);

        var result = await sut.DeleteAsync(999);

        result.Should().BeFalse();
    }

    // ── GetByIdAsync ───────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsShift()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            Id = 1, CompanyId = 1, EmployeeId = 1,
            StartTime = new DateTime(2026, 6, 1, 9,  0, 0, DateTimeKind.Utc),
            EndTime   = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        });
        await ctx.SaveChangesAsync();
        var sut = new ShiftRepository(ctx);

        var result = await sut.GetByIdAsync(1);

        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentId_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new ShiftRepository(ctx);

        var result = await sut.GetByIdAsync(999);

        result.Should().BeNull();
    }
}
