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
    private readonly IVacationRepository  _vacationRepository;
    private readonly IEmployeeRepository  _employeeRepository;
    private readonly IPushNotificationService _pushService;

    public VacationService(
        IVacationRepository vacationRepository,
        IEmployeeRepository employeeRepository,
        IPushNotificationService pushService)
    {
        _vacationRepository = vacationRepository;
        _employeeRepository = employeeRepository;
        _pushService        = pushService;
    }

    public Task<IReadOnlyList<VacationRequest>> GetVacationRequestsAsync(
        int companyId, CancellationToken ct = default)
        => _vacationRepository.GetByCompanyAsync(companyId, ct);

    public Task<IReadOnlyList<VacationRequest>> GetVacationRequestsByEmployeeAsync(
        int employeeId, CancellationToken ct = default)
        => _vacationRepository.GetByEmployeeAsync(employeeId, ct);

    public Task<VacationRequest?> GetVacationRequestByIdAsync(
        int id, CancellationToken ct = default)
        => _vacationRepository.GetByIdAsync(id, ct);

    public Task<VacationRequest> CreateVacationRequestAsync(
        VacationRequest request, CancellationToken ct = default)
    {
        request.Status = VacationRequestStatus.Pending;
        return _vacationRepository.AddAsync(request, ct);
        // Nota: la notifica all'admin viene gestita lato controller
        // in modo da avere accesso al CompanyId e al UserId dell'admin
    }

    public async Task<bool> ApproveVacationRequestAsync(
        int requestId, int reviewerUserId, string? note, CancellationToken ct = default)
    {
        var request = await _vacationRepository.GetByIdAsync(requestId, ct);
        if (request == null) return false;

        request.Status           = VacationRequestStatus.Approved;
        request.ReviewNote       = note ?? string.Empty;
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAt       = DateTime.UtcNow;
        await _vacationRepository.UpdateAsync(request, ct);

        // Notifica push al dipendente
        await NotifyEmployeeAsync(
            request.EmployeeId,
            "✅ Ferie approvate",
            $"Le tue ferie dal {request.StartDate:dd/MM} al {request.EndDate:dd/MM/yyyy} " +
            "sono state approvate.",
            "VacationRequest", requestId, ct);

        return true;
    }

    public async Task<bool> RejectVacationRequestAsync(
        int requestId, int reviewerUserId, string? note, CancellationToken ct = default)
    {
        var request = await _vacationRepository.GetByIdAsync(requestId, ct);
        if (request == null) return false;

        request.Status           = VacationRequestStatus.Rejected;
        request.ReviewNote       = note ?? string.Empty;
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAt       = DateTime.UtcNow;
        await _vacationRepository.UpdateAsync(request, ct);

        // Notifica push al dipendente
        var noteText = string.IsNullOrEmpty(note) ? string.Empty : $" Nota: {note}";
        await NotifyEmployeeAsync(
            request.EmployeeId,
            "❌ Ferie rifiutate",
            $"Le tue ferie dal {request.StartDate:dd/MM} al {request.EndDate:dd/MM/yyyy} " +
            $"sono state rifiutate.{noteText}",
            "VacationRequest", requestId, ct);

        return true;
    }

    public async Task<bool> UpdateVacationStatusAsync(
        int requestId, VacationRequest updated, CancellationToken ct = default)
    {
        var request = await _vacationRepository.GetByIdAsync(requestId, ct);
        if (request == null) return false;

        request.Type      = updated.Type;
        request.StartDate = updated.StartDate;
        request.EndDate   = updated.EndDate;
        request.TotalDays = updated.TotalDays;
        request.Reason    = updated.Reason;
        request.Status    = updated.Status;

        if (updated.ReviewedByUserId.HasValue)
        {
            request.ReviewedByUserId = updated.ReviewedByUserId;
            request.ReviewedAt       = updated.ReviewedAt;
        }

        await _vacationRepository.UpdateAsync(request, ct);
        return true;
    }

    public Task<bool> DeleteVacationRequestAsync(int id, CancellationToken ct = default)
        => _vacationRepository.DeleteAsync(id, ct);

    // ── Metodi privati ────────────────────────────────────────────

    private async Task NotifyEmployeeAsync(
        int employeeId, string title, string body,
        string entityType, int entityId, CancellationToken ct)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId, ct);
            if (employee?.UserId == null) return;

            await _pushService.SendToUserAsync(
                employee.UserId.Value, title, body, entityType, entityId, ct);
        }
        catch
        {
            // Silenzioso: push non critico
        }
    }
}
