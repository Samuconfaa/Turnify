using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;
using Turnify.Infrastructure.Services;
using Xunit;

namespace Turnify.Tests.Services;

public class ShiftServiceTests
{
    private readonly Mock<IShiftRepository> _shiftRepositoryMock;
    private readonly Mock<IVacationRepository> _vacationRepositoryMock; // Fix 2: era mancante
    private readonly ShiftService _sut;

    public ShiftServiceTests()
    {
        _shiftRepositoryMock    = new Mock<IShiftRepository>();
        _vacationRepositoryMock = new Mock<IVacationRepository>();

        // Fix 2: ShiftService richiede IVacationRepository per controllare ferie approvate
        _sut = new ShiftService(_shiftRepositoryMock.Object, _vacationRepositoryMock.Object);

        // Default: nessuna ferie approvata (non blocca la creazione turni)
        _vacationRepositoryMock
            .Setup(r => r.GetByEmployeeAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VacationRequest>());
    }

    [Fact]
    public async Task CreateShiftAsync_ValidShift_ReturnsCreatedShift()
    {
        // Arrange
        var shift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime    = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(r => r.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime,
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _shiftRepositoryMock
            .Setup(r => r.AddAsync(shift, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shift);

        // Act
        var result = await _sut.CreateShiftAsync(shift);

        // Assert
        result.Should().NotBeNull();
        result.CompanyId.Should().Be(shift.CompanyId);
        _shiftRepositoryMock.Verify(r => r.AddAsync(shift, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateShiftAsync_OverlappingShift_ThrowsInvalidOperationException()
    {
        // Arrange
        var shift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime    = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(r => r.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime,
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _sut.CreateShiftAsync(shift);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Il turno si sovrappone con un altro turno esistente.");

        _shiftRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Shift>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateShiftAsync_EmployeeOnApprovedVacation_ThrowsInvalidOperationException()
    {
        // Arrange — dipendente ha ferie approvate che coprono il giorno del turno
        var shiftDate = new DateTime(2026, 7, 10);
        var shift = new Shift
        {
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = shiftDate.AddHours(9),
            EndTime    = shiftDate.AddHours(17)
        };

        _shiftRepositoryMock
            .Setup(r => r.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime,
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _vacationRepositoryMock
            .Setup(r => r.GetByEmployeeAsync(shift.EmployeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VacationRequest>
            {
                new VacationRequest
                {
                    EmployeeId = 1,
                    StartDate  = new DateTime(2026, 7, 1),
                    EndDate    = new DateTime(2026, 7, 14),
                    Status     = VacationRequestStatus.Approved
                }
            });

        // Act
        Func<Task> act = async () => await _sut.CreateShiftAsync(shift);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*ferie approvate*");

        _shiftRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Shift>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateShiftAsync_OverlappingWithOtherShift_ThrowsException()
    {
        // Arrange
        var shift = new Shift
        {
            Id         = 5,
            CompanyId  = 1,
            EmployeeId = 1,
            StartTime  = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime    = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(r => r.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime,
                shift.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _sut.UpdateShiftAsync(shift);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Il turno modificato si sovrappone con un altro turno esistente.");

        _shiftRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Shift>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteShiftAsync_ExistingShift_ReturnsTrue()
    {
        // Arrange
        var shiftId = 1;

        _shiftRepositoryMock
            .Setup(r => r.DeleteAsync(shiftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.DeleteShiftAsync(shiftId);

        // Assert
        result.Should().BeTrue();
        _shiftRepositoryMock.Verify(r => r.DeleteAsync(shiftId,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetShiftsAsync_ReturnsOnlyCompanyShifts()
    {
        // Arrange
        var companyId = 1;
        var from      = new DateTime(2026, 1, 1);
        var to        = new DateTime(2026, 1, 31);

        var expectedShifts = new List<Shift>
        {
            new Shift { Id = 1, CompanyId = companyId },
            new Shift { Id = 2, CompanyId = companyId }
        };

        _shiftRepositoryMock
            .Setup(r => r.GetByCompanyAsync(companyId, from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedShifts);

        // Act
        var result = await _sut.GetShiftsAsync(companyId, from, to);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.CompanyId == companyId);
        _shiftRepositoryMock.Verify(r => r.GetByCompanyAsync(companyId, from, to,
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
