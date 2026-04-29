using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Data;
using Turnify.Infrastructure.Services;
using Xunit;

namespace Turnify.Tests.Services;

public class DashboardServiceTests
{
    private static TurnifyDbContext CreateContext(string dbName)
    {
        var opts = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new TurnifyDbContext(opts);
    }

    private static (DashboardService sut, TurnifyDbContext ctx) Build(
        string dbName, Mock<IAttendanceRepository>? attendanceMock = null)
    {
        var ctx = CreateContext(dbName);
        if (attendanceMock == null)
        {
            attendanceMock = new Mock<IAttendanceRepository>();
            attendanceMock.Setup(r => r.GetTodayByEmployeeAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((AttendanceLog?)null);
            attendanceMock.Setup(r => r.GetByEmployeeInRangeAsync(It.IsAny<int>(), It.IsAny<DateTime>(),
                    It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<AttendanceLog>());
        }
        return (new DashboardService(ctx, attendanceMock.Object), ctx);
    }

    // ── GetSummaryAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetSummaryAsync_CountsOnlyActiveEmployeesInCompany()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        ctx.Employees.AddRange(
            new Employee { Id = 1, CompanyId = 1, FirstName = "Mario", LastName = "Rossi",   Email = "mario@t.it", IsActive = true  },
            new Employee { Id = 2, CompanyId = 1, FirstName = "Luigi", LastName = "Verdi",   Email = "luigi@t.it", IsActive = false },
            new Employee { Id = 3, CompanyId = 2, FirstName = "Anna",  LastName = "Bianchi", Email = "anna@t.it",  IsActive = true  }
        );
        await ctx.SaveChangesAsync();

        var from   = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to     = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);
        var result = await sut.GetSummaryAsync(companyId: 1, from, to);

        result.TotalEmployees.Should().Be(1);
    }

    [Fact]
    public async Task GetSummaryAsync_CountsShiftsInExplicitRange()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 2,  9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 2,  17, 0, 0, DateTimeKind.Utc) },
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 4,  9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 4,  17, 0, 0, DateTimeKind.Utc) },
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 10, 17, 0, 0, DateTimeKind.Utc) }, // fuori range
            new Shift { CompanyId = 2, EmployeeId = 2, StartTime = new DateTime(2026, 6, 3,  9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 3,  17, 0, 0, DateTimeKind.Utc) }  // altra company
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetSummaryAsync(companyId: 1, from, to);

        result.ShiftsThisWeek.Should().Be(2);
    }

    [Fact]
    public async Task GetSummaryAsync_CalculatesTotalHoursCorrectly()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1,
                StartTime = new DateTime(2026, 6, 2, 9,  0, 0, DateTimeKind.Utc),
                EndTime   = new DateTime(2026, 6, 2, 17, 0, 0, DateTimeKind.Utc) },  // 8h
            new Shift { CompanyId = 1, EmployeeId = 2,
                StartTime = new DateTime(2026, 6, 3, 8,  0, 0, DateTimeKind.Utc),
                EndTime   = new DateTime(2026, 6, 3, 12, 0, 0, DateTimeKind.Utc) }   // 4h
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetSummaryAsync(companyId: 1, from, to);

        result.TotalHoursScheduled.Should().Be(12m);
    }

    [Fact]
    public async Task GetSummaryAsync_CountsOnlyPendingVacations()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        ctx.VacationRequests.AddRange(
            new VacationRequest { CompanyId = 1, EmployeeId = 1, Status = VacationRequestStatus.Pending,  StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(3) },
            new VacationRequest { CompanyId = 1, EmployeeId = 2, Status = VacationRequestStatus.Approved, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(2) },
            new VacationRequest { CompanyId = 1, EmployeeId = 3, Status = VacationRequestStatus.Pending,  StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(1) }
        );
        await ctx.SaveChangesAsync();

        var from   = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to     = new DateTime(2026, 1, 8, 0, 0, 0, DateTimeKind.Utc);
        var result = await sut.GetSummaryAsync(companyId: 1, from, to);

        result.PendingVacations.Should().Be(2);
    }

    [Fact]
    public async Task GetSummaryAsync_ShiftsTodayReturnsOnlyTodayShifts()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var today = DateTime.UtcNow.Date;

        ctx.Employees.Add(new Employee { Id = 1, CompanyId = 1, FirstName = "Mario", LastName = "Rossi", Email = "mario@t.it", IsActive = true });
        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = today.AddHours(9),  EndTime = today.AddHours(17) },                // oggi
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = today.AddDays(1).AddHours(9), EndTime = today.AddDays(1).AddHours(17) } // domani
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetSummaryAsync(companyId: 1, today, today.AddDays(7));

        result.ShiftsToday.Should().HaveCount(1);
        result.ShiftsToday[0].EmployeeName.Should().Be("Mario Rossi");
    }

    [Fact]
    public async Task GetSummaryAsync_PendingRequestsContainsEmployeeNames()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        ctx.Employees.Add(new Employee { Id = 1, CompanyId = 1, FirstName = "Luca", LastName = "Ferrari", Email = "luca@t.it", IsActive = true });
        ctx.VacationRequests.Add(new VacationRequest
        {
            CompanyId  = 1, EmployeeId = 1,
            Status     = VacationRequestStatus.Pending,
            StartDate  = DateTime.UtcNow.AddDays(5),
            EndDate    = DateTime.UtcNow.AddDays(10)
        });
        await ctx.SaveChangesAsync();

        var from   = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to     = new DateTime(2026, 1, 8, 0, 0, 0, DateTimeKind.Utc);
        var result = await sut.GetSummaryAsync(companyId: 1, from, to);

        result.PendingRequests.Should().HaveCount(1);
        result.PendingRequests[0].EmployeeName.Should().Be("Luca Ferrari");
    }

    [Fact]
    public async Task GetSummaryAsync_EmptyCompany_ReturnsZeroes()
    {
        var (sut, _) = Build(Guid.NewGuid().ToString());

        var from   = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to     = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);
        var result = await sut.GetSummaryAsync(companyId: 99, from, to);

        result.TotalEmployees.Should().Be(0);
        result.ShiftsThisWeek.Should().Be(0);
        result.PendingVacations.Should().Be(0);
        result.TotalHoursScheduled.Should().Be(0);
        result.ShiftsToday.Should().BeEmpty();
        result.PendingRequests.Should().BeEmpty();
    }

    // ── GetHoursByEmployeeAsync ────────────────────────────────────

    [Fact]
    public async Task GetHoursByEmployeeAsync_GroupsAndSumsCorrectly()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        ctx.Employees.AddRange(
            new Employee { Id = 1, CompanyId = 1, FirstName = "Mario", LastName = "Rossi", Email = "mario@t.it", IsActive = true },
            new Employee { Id = 2, CompanyId = 1, FirstName = "Luigi", LastName = "Verdi", Email = "luigi@t.it", IsActive = true }
        );
        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 2, 9,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 2, 17, 0, 0, DateTimeKind.Utc) }, // 8h Mario
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 3, 9,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 3, 13, 0, 0, DateTimeKind.Utc) }, // 4h Mario
            new Shift { CompanyId = 1, EmployeeId = 2, StartTime = new DateTime(2026, 6, 4, 8,  0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 4, 16, 0, 0, DateTimeKind.Utc) }  // 8h Luigi
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetHoursByEmployeeAsync(companyId: 1, from, to);

        result.Should().HaveCount(2);
        var mario = result.Single(e => e.EmployeeName == "Mario Rossi");
        mario.ShiftsCount.Should().Be(2);
        mario.ScheduledHours.Should().Be(12m);
        var luigi = result.Single(e => e.EmployeeName == "Luigi Verdi");
        luigi.ShiftsCount.Should().Be(1);
        luigi.ScheduledHours.Should().Be(8m);
    }

    [Fact]
    public async Task GetHoursByEmployeeAsync_EmptyRange_ReturnsEmpty()
    {
        var (sut, _) = Build(Guid.NewGuid().ToString());

        var result = await sut.GetHoursByEmployeeAsync(
            companyId: 1,
            from: new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            to:   new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc));

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetHoursByEmployeeAsync_ExcludesOtherCompanies()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var from = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc);

        ctx.Employees.AddRange(
            new Employee { Id = 1, CompanyId = 1, FirstName = "A", LastName = "B", Email = "a@t.it", IsActive = true },
            new Employee { Id = 2, CompanyId = 2, FirstName = "C", LastName = "D", Email = "c@t.it", IsActive = true }
        );
        ctx.Shifts.AddRange(
            new Shift { CompanyId = 1, EmployeeId = 1, StartTime = new DateTime(2026, 6, 2, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 2, 17, 0, 0, DateTimeKind.Utc) },
            new Shift { CompanyId = 2, EmployeeId = 2, StartTime = new DateTime(2026, 6, 2, 9, 0, 0, DateTimeKind.Utc), EndTime = new DateTime(2026, 6, 2, 17, 0, 0, DateTimeKind.Utc) }
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetHoursByEmployeeAsync(companyId: 1, from, to);

        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(1);
    }

    // ── GetEmployeeSummaryAsync ────────────────────────────────────

    [Fact]
    public async Task GetEmployeeSummaryAsync_NoShifts_NextShiftIsNull()
    {
        var (sut, _) = Build(Guid.NewGuid().ToString());

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.NextShift.Should().BeNull();
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_FutureShift_ReturnsNextShift()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var futureShift = new Shift
        {
            EmployeeId = 1, CompanyId = 1,
            StartTime  = DateTime.UtcNow.AddHours(2),
            EndTime    = DateTime.UtcNow.AddHours(10),
            Status     = ShiftStatus.Scheduled
        };
        ctx.Shifts.Add(futureShift);
        await ctx.SaveChangesAsync();

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.NextShift.Should().NotBeNull();
        result.NextShift!.EmployeeId.Should().Be(1);
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_CancelledShift_NotReturnedAsNextShift()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        ctx.Shifts.Add(new Shift
        {
            EmployeeId = 1, CompanyId = 1,
            StartTime  = DateTime.UtcNow.AddHours(2),
            EndTime    = DateTime.UtcNow.AddHours(10),
            Status     = ShiftStatus.Cancelled
        });
        await ctx.SaveChangesAsync();

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.NextShift.Should().BeNull();
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_CheckedIn_IsCheckedInTodayTrue()
    {
        var attendanceMock = new Mock<IAttendanceRepository>();
        var todayLog = new AttendanceLog
        {
            EmployeeId   = 1,
            CheckInTime  = DateTime.UtcNow.Date.AddHours(9),
            CheckOutTime = null
        };
        attendanceMock
            .Setup(r => r.GetTodayByEmployeeAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(todayLog);
        attendanceMock
            .Setup(r => r.GetByEmployeeInRangeAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AttendanceLog>());

        var (sut, _) = Build(Guid.NewGuid().ToString(), attendanceMock);

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.IsCheckedInToday.Should().BeTrue();
        result.TodayCheckIn.Should().Be(todayLog.CheckInTime);
        result.TodayCheckOut.Should().BeNull();
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_CheckedOut_IsCheckedInTodayFalse()
    {
        var attendanceMock = new Mock<IAttendanceRepository>();
        var todayLog = new AttendanceLog
        {
            EmployeeId   = 1,
            CheckInTime  = DateTime.UtcNow.Date.AddHours(9),
            CheckOutTime = DateTime.UtcNow.Date.AddHours(17)
        };
        attendanceMock
            .Setup(r => r.GetTodayByEmployeeAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(todayLog);
        attendanceMock
            .Setup(r => r.GetByEmployeeInRangeAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AttendanceLog>());

        var (sut, _) = Build(Guid.NewGuid().ToString(), attendanceMock);

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.IsCheckedInToday.Should().BeFalse();
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_CompletedLogs_CalculatesHoursWorked()
    {
        var attendanceMock = new Mock<IAttendanceRepository>();
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var logs = new List<AttendanceLog>
        {
            new AttendanceLog { EmployeeId = 1, CheckInTime = monthStart.AddDays(1).AddHours(9),  CheckOutTime = monthStart.AddDays(1).AddHours(17) }, // 8h
            new AttendanceLog { EmployeeId = 1, CheckInTime = monthStart.AddDays(2).AddHours(8),  CheckOutTime = monthStart.AddDays(2).AddHours(12) }, // 4h
            new AttendanceLog { EmployeeId = 1, CheckInTime = monthStart.AddDays(3).AddHours(9),  CheckOutTime = null }                                 // no checkout — non conta
        };
        attendanceMock
            .Setup(r => r.GetTodayByEmployeeAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AttendanceLog?)null);
        attendanceMock
            .Setup(r => r.GetByEmployeeInRangeAsync(1, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(logs);

        var (sut, _) = Build(Guid.NewGuid().ToString(), attendanceMock);

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.HoursWorkedThisMonth.Should().Be(12m);
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_ApprovedVacations_CountsDaysUsed()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var yearStart = new DateTime(DateTime.UtcNow.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        ctx.VacationRequests.AddRange(
            new VacationRequest { EmployeeId = 1, Status = VacationRequestStatus.Approved, TotalDays = 5, StartDate = yearStart.AddMonths(1), EndDate = yearStart.AddMonths(1).AddDays(5) },
            new VacationRequest { EmployeeId = 1, Status = VacationRequestStatus.Approved, TotalDays = 3, StartDate = yearStart.AddMonths(2), EndDate = yearStart.AddMonths(2).AddDays(3) },
            new VacationRequest { EmployeeId = 1, Status = VacationRequestStatus.Pending,  TotalDays = 2, StartDate = yearStart.AddMonths(3), EndDate = yearStart.AddMonths(3).AddDays(2) } // pending — non conta
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.VacationDaysUsedThisYear.Should().Be(8);
        result.PendingVacationRequests.Should().Be(1);
    }

    [Fact]
    public async Task GetEmployeeSummaryAsync_WeeklyShifts_CalculatesHoursScheduled()
    {
        var (sut, ctx) = Build(Guid.NewGuid().ToString());
        var today = DateTime.UtcNow.Date;

        ctx.Shifts.AddRange(
            new Shift { EmployeeId = 1, CompanyId = 1,
                StartTime = today.AddHours(9),  EndTime = today.AddHours(17) },          // 8h oggi
            new Shift { EmployeeId = 1, CompanyId = 1,
                StartTime = today.AddDays(1).AddHours(8), EndTime = today.AddDays(1).AddHours(12) } // 4h domani
        );
        await ctx.SaveChangesAsync();

        var result = await sut.GetEmployeeSummaryAsync(employeeId: 1, companyId: 1);

        result.HoursScheduledThisWeek.Should().Be(12m);
    }
}
