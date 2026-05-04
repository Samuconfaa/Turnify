using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Infrastructure.Services;

public class VacationService : IVacationService
{
    private readonly IVacationRepository _vacationRepository;

    public VacationService(IVacationRepository vacationRepository)
    {
        _vacationRepository = vacationRepository;
    }

    public Task<IReadOnlyList<VacationRequest>> GetVacationRequestsAsync(int companyId, CancellationToken ct = default)
    {
        return _vacationRepository.GetByCompanyAsync(companyId, ct);
    }

    public Task<IReadOnlyList<VacationRequest>> GetVacationRequestsByEmployeeAsync(int employeeId, CancellationToken ct = default)
    {
        return _vacationRepository.GetByEmployeeAsync(employeeId, ct);
    }

    public Task<VacationRequest?> GetVacationRequestByIdAsync(int id, CancellationToken ct = default)
    {
        return _vacationRepository.GetByIdAsync(id, ct);
    }

    public Task<VacationRequest> CreateVacationRequestAsync(VacationRequest request, CancellationToken ct = default)
    {
        request.Status = VacationRequestStatus.Pending;
        return _vacationRepository.AddAsync(request, ct);
    }

    public async Task<bool> ApproveVacationRequestAsync(int requestId, int reviewerUserId, string? note, CancellationToken ct = default)
    {
        var request = await _vacationRepository.GetByIdAsync(requestId, ct);
        if (request == null) return false;

        request.Status = VacationRequestStatus.Approved;
        request.ReviewNote = note ?? string.Empty;
        request.ReviewedAt = DateTime.UtcNow;

        await _vacationRepository.UpdateAsync(request, ct);
        return true;
    }

    public async Task<bool> RejectVacationRequestAsync(int requestId, int reviewerUserId, string? note, CancellationToken ct = default)
    {
        var request = await _vacationRepository.GetByIdAsync(requestId, ct);
        if (request == null) return false;

        request.Status = VacationRequestStatus.Rejected;
        request.ReviewNote = note ?? string.Empty;
        request.ReviewedAt = DateTime.UtcNow;

        await _vacationRepository.UpdateAsync(request, ct);
        return true;
    }

    public Task<bool> DeleteVacationRequestAsync(int id, CancellationToken ct = default)
    {
        return _vacationRepository.DeleteAsync(id, ct);
    }
}
