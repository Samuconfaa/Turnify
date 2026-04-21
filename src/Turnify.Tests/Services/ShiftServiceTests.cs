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
    private readonly ShiftService _sut; // System Under Test

    public ShiftServiceTests()
    {
        _shiftRepositoryMock = new Mock<IShiftRepository>();
        _sut = new ShiftService(_shiftRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateShiftAsync_ValidShift_ReturnsCreatedShift()
    {
        // Arrange
        var shift = new Shift
        {
            CompanyId = 1,
            EmployeeId = 1,
            StartTime = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(repo => repo.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _shiftRepositoryMock
            .Setup(repo => repo.AddAsync(shift, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shift);

        // Act
        var result = await _sut.CreateShiftAsync(shift);

        // Assert
        result.Should().NotBeNull();
        result.CompanyId.Should().Be(shift.CompanyId);
        _shiftRepositoryMock.Verify(repo => repo.AddAsync(shift, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateShiftAsync_OverlappingShift_ThrowsInvalidOperationException()
    {
        // Arrange
        var shift = new Shift
        {
            CompanyId = 1,
            EmployeeId = 1,
            StartTime = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(repo => repo.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _sut.CreateShiftAsync(shift);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Il turno si sovrappone con un altro turno esistente.");
        
        _shiftRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Shift>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateShiftAsync_OverlappingWithOtherShift_ThrowsException()
    {
        // Arrange
        var shift = new Shift
        {
            Id = 5,
            CompanyId = 1,
            EmployeeId = 1,
            StartTime = new DateTime(2026, 1, 1, 9, 0, 0),
            EndTime = new DateTime(2026, 1, 1, 17, 0, 0)
        };

        _shiftRepositoryMock
            .Setup(repo => repo.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _sut.UpdateShiftAsync(shift);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Il turno modificato si sovrappone con un altro turno esistente.");

        _shiftRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<Shift>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteShiftAsync_ExistingShift_ReturnsTrue()
    {
        // Arrange
        var shiftId = 1;

        _shiftRepositoryMock
            .Setup(repo => repo.DeleteAsync(shiftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.DeleteShiftAsync(shiftId);

        // Assert
        result.Should().BeTrue();
        _shiftRepositoryMock.Verify(repo => repo.DeleteAsync(shiftId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetShiftsAsync_ReturnsOnlyCompanyShifts()
    {
        // Arrange
        var companyId = 1;
        var from = new DateTime(2026, 1, 1);
        var to = new DateTime(2026, 1, 31);

        var expectedShifts = new List<Shift>
        {
            new Shift { Id = 1, CompanyId = companyId },
            new Shift { Id = 2, CompanyId = companyId }
        };

        _shiftRepositoryMock
            .Setup(repo => repo.GetByCompanyAsync(companyId, from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedShifts);

        // Act
        var result = await _sut.GetShiftsAsync(companyId, from, to);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(s => s.CompanyId == companyId);
        _shiftRepositoryMock.Verify(repo => repo.GetByCompanyAsync(companyId, from, to, It.IsAny<CancellationToken>()), Times.Once);
    }
}
