using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;
using Turnify.Infrastructure.Services;
using Xunit;

namespace Turnify.Tests.Services;

public class ShiftRecurringTests
{
    private readonly Mock<IShiftRepository>         _shiftRepoMock;
    private readonly Mock<IVacationRepository>      _vacationRepoMock;
    private readonly Mock<IEmployeeRepository>      _employeeRepoMock;
    private readonly Mock<IPushNotificationService> _pushMock;
    private readonly ShiftService _sut;

    public ShiftRecurringTests()
    {
        _shiftRepoMock    = new Mock<IShiftRepository>();
        _vacationRepoMock = new Mock<IVacationRepository>();
        _employeeRepoMock = new Mock<IEmployeeRepository>();
        _pushMock         = new Mock<IPushNotificationService>();

        _sut = new ShiftService(
            _shiftRepoMock.Object,
            _vacationRepoMock.Object,
            _employeeRepoMock.Object,
            _pushMock.Object);

        _vacationRepoMock
            .Setup(r => r.GetByEmployeeAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VacationRequest>());

        _shiftRepoMock
            .Setup(r => r.HasOverlapAsync(It.IsAny<int>(), It.IsAny<DateTime>(),
                It.IsAny<DateTime>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _shiftRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Shift>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Shift s, CancellationToken _) => s);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 1, UserId = null });
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_CreatesCorrectNumberOfShifts()
    {
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 4);

        result.Should().HaveCount(4);
        _shiftRepoMock.Verify(r => r.AddAsync(It.IsAny<Shift>(), It.IsAny<CancellationToken>()), Times.Exactly(4));
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_ShiftsAreOneWeekApart()
    {
        var baseStart = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc);
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = baseStart,
            EndTime    = baseStart.AddHours(8)
        };

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 3);

        result[0].StartTime.Should().Be(baseStart);
        result[1].StartTime.Should().Be(baseStart.AddDays(7));
        result[2].StartTime.Should().Be(baseStart.AddDays(14));
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_AllShiftsMarkedAsRecurring()
    {
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 2);

        result.Should().OnlyContain(s => s.IsRecurring);
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_AllShiftsHaveSameGroupId()
    {
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 3);

        var groupId = result[0].RecurringGroupId;
        result.Should().OnlyContain(s => s.RecurringGroupId == groupId);
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_SkipsWeeksWithOverlap()
    {
        var baseStart = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc);
        var baseShift = new Shift { CompanyId = 1, EmployeeId = 1, StartTime = baseStart, EndTime = baseStart.AddHours(8) };

        // Settimana 0: ok; settimana 1: overlap; settimana 2: ok
        _shiftRepoMock
            .Setup(r => r.HasOverlapAsync(1, baseStart, baseStart.AddHours(8), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _shiftRepoMock
            .Setup(r => r.HasOverlapAsync(1, baseStart.AddDays(7), baseStart.AddDays(7).AddHours(8), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _shiftRepoMock
            .Setup(r => r.HasOverlapAsync(1, baseStart.AddDays(14), baseStart.AddDays(14).AddHours(8), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 3);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_SkipsWeeksWithVacationConflict()
    {
        var baseStart   = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc);
        var baseShift   = new Shift { CompanyId = 1, EmployeeId = 1, StartTime = baseStart, EndTime = baseStart.AddHours(8) };
        var conflictDay = baseStart.AddDays(7).Date;

        _vacationRepoMock
            .Setup(r => r.GetByEmployeeAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VacationRequest>
            {
                new VacationRequest
                {
                    EmployeeId = 1,
                    StartDate  = conflictDay,
                    EndDate    = conflictDay,
                    Status     = VacationRequestStatus.Approved
                }
            });

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 2);

        result.Should().HaveCount(1); // solo la prima settimana
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_ZeroWeeks_ReturnsEmpty()
    {
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };

        var result = await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 0);

        result.Should().BeEmpty();
        _shiftRepoMock.Verify(r => r.AddAsync(It.IsAny<Shift>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateRecurringShiftsAsync_SendsPushNotificationOnce()
    {
        var baseShift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            EndTime    = new DateTime(2026, 6, 1, 17, 0, 0, DateTimeKind.Utc)
        };
        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 1, UserId = 42 });

        await _sut.CreateRecurringShiftsAsync(baseShift, weeks: 3);

        _pushMock.Verify(p => p.SendToUserAsync(
            42,
            It.Is<string>(s => s.Contains("ricorrenti")),
            It.IsAny<string>(),
            "Shift", It.IsAny<int?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
