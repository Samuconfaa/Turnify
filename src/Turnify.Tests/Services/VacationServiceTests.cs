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

public class VacationServiceTests
{
    private readonly Mock<IVacationRepository> _vacationRepoMock;
    private readonly Mock<IEmployeeRepository> _employeeRepoMock;
    private readonly Mock<IPushNotificationService> _pushServiceMock;
    private readonly VacationService _sut;

    public VacationServiceTests()
    {
        _vacationRepoMock = new Mock<IVacationRepository>();
        _employeeRepoMock = new Mock<IEmployeeRepository>();
        _pushServiceMock  = new Mock<IPushNotificationService>();

        _sut = new VacationService(
            _vacationRepoMock.Object,
            _employeeRepoMock.Object,
            _pushServiceMock.Object);
    }

    // ── CreateVacationRequestAsync ─────────────────────────────────

    [Fact]
    public async Task CreateVacationRequestAsync_AlwaysSetsPendingStatus()
    {
        var request = new VacationRequest
        {
            EmployeeId = 1,
            CompanyId  = 1,
            StartDate  = new DateTime(2026, 8, 1),
            EndDate    = new DateTime(2026, 8, 7),
            Status     = VacationRequestStatus.Approved // deve essere resettato
        };

        _vacationRepoMock
            .Setup(r => r.AddAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        await _sut.CreateVacationRequestAsync(request);

        request.Status.Should().Be(VacationRequestStatus.Pending);
        _vacationRepoMock.Verify(r => r.AddAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateVacationRequestAsync_ReturnsPersistedRequest()
    {
        var request = new VacationRequest { EmployeeId = 2, CompanyId = 1 };
        var persisted = new VacationRequest { Id = 42, EmployeeId = 2, CompanyId = 1, Status = VacationRequestStatus.Pending };

        _vacationRepoMock
            .Setup(r => r.AddAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(persisted);

        var result = await _sut.CreateVacationRequestAsync(request);

        result.Should().BeSameAs(persisted);
        result.Id.Should().Be(42);
    }

    // ── ApproveVacationRequestAsync ────────────────────────────────

    [Fact]
    public async Task ApproveVacationRequestAsync_RequestNotFound_ReturnsFalse()
    {
        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest?)null);

        var result = await _sut.ApproveVacationRequestAsync(99, reviewerUserId: 1, note: null);

        result.Should().BeFalse();
        _vacationRepoMock.Verify(r => r.UpdateAsync(It.IsAny<VacationRequest>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ApproveVacationRequestAsync_ValidRequest_SetsApprovedAndPersists()
    {
        var request = new VacationRequest
        {
            Id         = 1,
            EmployeeId = 5,
            StartDate  = new DateTime(2026, 8, 1),
            EndDate    = new DateTime(2026, 8, 7),
            Status     = VacationRequestStatus.Pending
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 5, UserId = 10 });

        var result = await _sut.ApproveVacationRequestAsync(1, reviewerUserId: 2, note: "OK");

        result.Should().BeTrue();
        request.Status.Should().Be(VacationRequestStatus.Approved);
        request.ReviewedByUserId.Should().Be(2);
        request.ReviewNote.Should().Be("OK");
        request.ReviewedAt.Should().NotBeNull();
        _vacationRepoMock.Verify(r => r.UpdateAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApproveVacationRequestAsync_SendsPushNotificationToEmployee()
    {
        var request = new VacationRequest
        {
            Id         = 1,
            EmployeeId = 5,
            StartDate  = new DateTime(2026, 8, 1),
            EndDate    = new DateTime(2026, 8, 7)
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 5, UserId = 10 });

        await _sut.ApproveVacationRequestAsync(1, reviewerUserId: 2, note: null);

        _pushServiceMock.Verify(p => p.SendToUserAsync(
            10,
            It.Is<string>(s => s.Contains("approvate")),
            It.IsAny<string>(),
            "VacationRequest", 1,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApproveVacationRequestAsync_EmployeeHasNoUserId_SkipsPushNotification()
    {
        var request = new VacationRequest { Id = 1, EmployeeId = 5 };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 5, UserId = null });

        var result = await _sut.ApproveVacationRequestAsync(1, reviewerUserId: 2, note: null);

        result.Should().BeTrue();
        _pushServiceMock.Verify(p => p.SendToUserAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ── RejectVacationRequestAsync ─────────────────────────────────

    [Fact]
    public async Task RejectVacationRequestAsync_RequestNotFound_ReturnsFalse()
    {
        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest?)null);

        var result = await _sut.RejectVacationRequestAsync(99, reviewerUserId: 1, note: null);

        result.Should().BeFalse();
        _vacationRepoMock.Verify(r => r.UpdateAsync(It.IsAny<VacationRequest>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RejectVacationRequestAsync_ValidRequest_SetsRejectedAndPersists()
    {
        var request = new VacationRequest
        {
            Id         = 2,
            EmployeeId = 7,
            StartDate  = new DateTime(2026, 9, 1),
            EndDate    = new DateTime(2026, 9, 5),
            Status     = VacationRequestStatus.Pending
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 7, UserId = 20 });

        var result = await _sut.RejectVacationRequestAsync(2, reviewerUserId: 3, note: "Periodo già occupato");

        result.Should().BeTrue();
        request.Status.Should().Be(VacationRequestStatus.Rejected);
        request.ReviewedByUserId.Should().Be(3);
        request.ReviewNote.Should().Be("Periodo già occupato");
        _vacationRepoMock.Verify(r => r.UpdateAsync(request, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RejectVacationRequestAsync_WithNote_IncludesNoteInPushBody()
    {
        var request = new VacationRequest
        {
            Id         = 2,
            EmployeeId = 7,
            StartDate  = new DateTime(2026, 9, 1),
            EndDate    = new DateTime(2026, 9, 5)
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 7, UserId = 20 });

        await _sut.RejectVacationRequestAsync(2, reviewerUserId: 3, note: "Carenza di personale");

        _pushServiceMock.Verify(p => p.SendToUserAsync(
            20,
            It.Is<string>(s => s.Contains("rifiutate")),
            It.Is<string>(body => body.Contains("Carenza di personale")),
            "VacationRequest", 2,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RejectVacationRequestAsync_WithoutNote_PushBodyHasNoNoteSection()
    {
        var request = new VacationRequest { Id = 3, EmployeeId = 8,
            StartDate = new DateTime(2026, 9, 1), EndDate = new DateTime(2026, 9, 3) };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(3, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(8, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 8, UserId = 30 });

        await _sut.RejectVacationRequestAsync(3, reviewerUserId: 1, note: null);

        _pushServiceMock.Verify(p => p.SendToUserAsync(
            30,
            It.IsAny<string>(),
            It.Is<string>(body => !body.Contains("Nota:")),
            It.IsAny<string>(), It.IsAny<int?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── UpdateVacationStatusAsync ──────────────────────────────────

    [Fact]
    public async Task UpdateVacationStatusAsync_RequestNotFound_ReturnsFalse()
    {
        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest?)null);

        var result = await _sut.UpdateVacationStatusAsync(99, new VacationRequest());

        result.Should().BeFalse();
        _vacationRepoMock.Verify(r => r.UpdateAsync(It.IsAny<VacationRequest>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateVacationStatusAsync_ExistingRequest_UpdatesFieldsAndReturnsTrue()
    {
        var existing = new VacationRequest
        {
            Id        = 4,
            StartDate = new DateTime(2026, 7, 1),
            EndDate   = new DateTime(2026, 7, 5),
            Status    = VacationRequestStatus.Pending,
            Reason    = "Vecchio motivo"
        };

        var updated = new VacationRequest
        {
            StartDate = new DateTime(2026, 7, 10),
            EndDate   = new DateTime(2026, 7, 15),
            TotalDays = 5,
            Reason    = "Nuovo motivo",
            Status    = VacationRequestStatus.Approved,
            ReviewedByUserId = null
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(4, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        var result = await _sut.UpdateVacationStatusAsync(4, updated);

        result.Should().BeTrue();
        existing.StartDate.Should().Be(updated.StartDate);
        existing.EndDate.Should().Be(updated.EndDate);
        existing.TotalDays.Should().Be(5);
        existing.Reason.Should().Be("Nuovo motivo");
        existing.Status.Should().Be(VacationRequestStatus.Approved);
        _vacationRepoMock.Verify(r => r.UpdateAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateVacationStatusAsync_WithReviewer_UpdatesReviewerFields()
    {
        var existing = new VacationRequest { Id = 5 };
        var reviewedAt = new DateTime(2026, 7, 20);
        var updated = new VacationRequest
        {
            Status           = VacationRequestStatus.Rejected,
            ReviewedByUserId = 7,
            ReviewedAt       = reviewedAt
        };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        await _sut.UpdateVacationStatusAsync(5, updated);

        existing.ReviewedByUserId.Should().Be(7);
        existing.ReviewedAt.Should().Be(reviewedAt);
    }

    // ── DeleteVacationRequestAsync ─────────────────────────────────

    [Fact]
    public async Task DeleteVacationRequestAsync_ExistingRequest_ReturnsTrue()
    {
        _vacationRepoMock
            .Setup(r => r.DeleteAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _sut.DeleteVacationRequestAsync(10);

        result.Should().BeTrue();
        _vacationRepoMock.Verify(r => r.DeleteAsync(10, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteVacationRequestAsync_NonExistentRequest_ReturnsFalse()
    {
        _vacationRepoMock
            .Setup(r => r.DeleteAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.DeleteVacationRequestAsync(999);

        result.Should().BeFalse();
    }

    // ── GetVacationRequestsAsync ───────────────────────────────────

    [Fact]
    public async Task GetVacationRequestsAsync_DelegatesToRepository()
    {
        var companyId = 5;
        var expected = new List<VacationRequest>
        {
            new VacationRequest { Id = 1, CompanyId = companyId },
            new VacationRequest { Id = 2, CompanyId = companyId }
        };

        _vacationRepoMock
            .Setup(r => r.GetByCompanyAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _sut.GetVacationRequestsAsync(companyId);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(v => v.CompanyId == companyId);
        _vacationRepoMock.Verify(r => r.GetByCompanyAsync(companyId,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetVacationRequestsByEmployeeAsync_DelegatesToRepository()
    {
        var employeeId = 3;
        var expected = new List<VacationRequest>
        {
            new VacationRequest { Id = 1, EmployeeId = employeeId }
        };

        _vacationRepoMock
            .Setup(r => r.GetByEmployeeAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _sut.GetVacationRequestsByEmployeeAsync(employeeId);

        result.Should().HaveCount(1);
        _vacationRepoMock.Verify(r => r.GetByEmployeeAsync(employeeId,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── Push notification - resilienza ────────────────────────────

    [Fact]
    public async Task ApproveVacationRequestAsync_PushThrows_StillReturnsTrue()
    {
        var request = new VacationRequest { Id = 1, EmployeeId = 5,
            StartDate = new DateTime(2026, 8, 1), EndDate = new DateTime(2026, 8, 7) };

        _vacationRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _vacationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<VacationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VacationRequest r, CancellationToken _) => r);

        _employeeRepoMock
            .Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Employee { Id = 5, UserId = 10 });

        _pushServiceMock
            .Setup(p => p.SendToUserAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("FCM non disponibile"));

        var result = await _sut.ApproveVacationRequestAsync(1, reviewerUserId: 2, note: null);

        result.Should().BeTrue();
    }
}
