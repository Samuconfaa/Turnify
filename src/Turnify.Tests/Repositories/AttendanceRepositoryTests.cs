using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Repositories;
using Xunit;

namespace Turnify.Tests.Repositories;

public class AttendanceRepositoryTests
{
    private static TurnifyDbContext CreateContext(string dbName)
    {
        var opts = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TurnifyDbContext(opts);
    }

    // ── GetTodayByEmployeeAsync ────────────────────────────────────

    [Fact]
    public async Task GetTodayByEmployeeAsync_LogFromToday_ReturnsLog()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.AttendanceLogs.Add(new AttendanceLog
        {
            EmployeeId  = 1,
            CompanyId   = 1,
            CheckInTime = DateTime.UtcNow.Date.AddHours(9)
        });
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetTodayByEmployeeAsync(1);

        result.Should().NotBeNull();
        result!.EmployeeId.Should().Be(1);
    }

    [Fact]
    public async Task GetTodayByEmployeeAsync_LogFromYesterday_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.AttendanceLogs.Add(new AttendanceLog
        {
            EmployeeId  = 1,
            CompanyId   = 1,
            CheckInTime = DateTime.UtcNow.Date.AddDays(-1).AddHours(9) // ieri
        });
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetTodayByEmployeeAsync(1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTodayByEmployeeAsync_DifferentEmployee_ReturnsNull()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.AttendanceLogs.Add(new AttendanceLog
        {
            EmployeeId  = 2, // altro dipendente
            CompanyId   = 1,
            CheckInTime = DateTime.UtcNow.Date.AddHours(9)
        });
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetTodayByEmployeeAsync(1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTodayByEmployeeAsync_LogAtMidnight_ReturnsLog()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        ctx.AttendanceLogs.Add(new AttendanceLog
        {
            EmployeeId  = 1,
            CompanyId   = 1,
            CheckInTime = DateTime.UtcNow.Date // esattamente mezzanotte UTC
        });
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetTodayByEmployeeAsync(1);

        result.Should().NotBeNull();
    }

    // ── GetByEmployeeInRangeAsync ──────────────────────────────────

    [Fact]
    public async Task GetByEmployeeInRangeAsync_FiltersEmployeeAndRange()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        ctx.AttendanceLogs.AddRange(
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 5,  9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 7, 1,  9, 0, 0, DateTimeKind.Utc) }, // fuori range
            new AttendanceLog { EmployeeId = 2, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 5,  9, 0, 0, DateTimeKind.Utc) }  // altro dipendente
        );
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetByEmployeeInRangeAsync(employeeId: 1, from, to);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(l => l.EmployeeId == 1);
    }

    [Fact]
    public async Task GetByEmployeeInRangeAsync_ResultsOrderedDescending()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        ctx.AttendanceLogs.AddRange(
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 5,  9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 2,  9, 0, 0, DateTimeKind.Utc) }
        );
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetByEmployeeInRangeAsync(employeeId: 1, from, to);

        result.Should().BeInDescendingOrder(l => l.CheckInTime);
    }

    // ── GetByCompanyInRangeAsync ───────────────────────────────────

    [Fact]
    public async Task GetByCompanyInRangeAsync_FiltersCorrectly()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        ctx.AttendanceLogs.AddRange(
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 5, 9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 2, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 6, 9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 3, CompanyId = 2, CheckInTime = new DateTime(2026, 6, 5, 9, 0, 0, DateTimeKind.Utc) }  // altra company
        );
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetByCompanyInRangeAsync(companyId: 1, from, to);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(l => l.CompanyId == 1);
    }

    [Fact]
    public async Task GetByCompanyInRangeAsync_OrderedDescending()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        ctx.AttendanceLogs.AddRange(
            new AttendanceLog { EmployeeId = 1, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 2, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 5,  9, 0, 0, DateTimeKind.Utc) },
            new AttendanceLog { EmployeeId = 3, CompanyId = 1, CheckInTime = new DateTime(2026, 6, 15, 9, 0, 0, DateTimeKind.Utc) }
        );
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        var result = await sut.GetByCompanyInRangeAsync(companyId: 1, from, to);

        result.Should().BeInDescendingOrder(l => l.CheckInTime);
    }

    // ── AddAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task AddAsync_PersistsLog()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var sut = new AttendanceRepository(ctx);
        var log = new AttendanceLog
        {
            EmployeeId  = 1,
            CompanyId   = 1,
            CheckInTime = DateTime.UtcNow.Date.AddHours(9)
        };

        var result = await sut.AddAsync(log);

        result.Should().NotBeNull();
        ctx.AttendanceLogs.Should().HaveCount(1);
    }

    // ── UpdateAsync ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesCheckout()
    {
        await using var ctx = CreateContext(Guid.NewGuid().ToString());
        var log = new AttendanceLog
        {
            EmployeeId   = 1,
            CompanyId    = 1,
            CheckInTime  = DateTime.UtcNow.Date.AddHours(9),
            CheckOutTime = null
        };
        ctx.AttendanceLogs.Add(log);
        await ctx.SaveChangesAsync();
        var sut = new AttendanceRepository(ctx);

        log.CheckOutTime = DateTime.UtcNow.Date.AddHours(17);
        await sut.UpdateAsync(log);

        var updated = await ctx.AttendanceLogs.FirstAsync();
        updated.CheckOutTime.Should().NotBeNull();
        updated.CheckOutTime!.Value.Hour.Should().Be(17);
    }
}
