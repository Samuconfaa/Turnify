using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface IVacationService
{
    Task<IReadOnlyList<VacationRequest>> GetVacationRequestsAsync(int companyId, CancellationToken ct = default);
    Task<VacationRequest> CreateVacationRequestAsync(VacationRequest request, CancellationToken ct = default);
    Task<bool> ApproveVacationRequestAsync(int requestId, int reviewerUserId, string? note, CancellationToken ct = default);
    Task<bool> RejectVacationRequestAsync(int requestId, int reviewerUserId, string? note, CancellationToken ct = default);
}
