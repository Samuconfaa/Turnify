using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Infrastructure.Services;

public class ShiftService : IShiftService
{
    private readonly IShiftRepository    _shiftRepository;
    private readonly IVacationRepository _vacationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPushNotificationService _pushService;

    public ShiftService(
        IShiftRepository shiftRepository,
        IVacationRepository vacationRepository,
        IEmployeeRepository employeeRepository,
        IPushNotificationService pushService)
    {
        _shiftRepository    = shiftRepository;
        _vacationRepository = vacationRepository;
        _employeeRepository = employeeRepository;
        _pushService        = pushService;
    }

    public Task<IReadOnlyList<Shift>> GetShiftsAsync(
        int companyId, DateTime from, DateTime to, CancellationToken ct = default)
        => _shiftRepository.GetByCompanyAsync(companyId, from, to, ct);

    public Task<Shift?> GetShiftByIdAsync(int id, CancellationToken ct = default)
        => _shiftRepository.GetByIdAsync(id, ct);

    public Task<IReadOnlyList<Shift>> GetShiftsByEmployeeAsync(
        int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
        => _shiftRepository.GetByEmployeeAsync(employeeId, from, to, ct);

    public async Task<Shift> CreateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        var hasOverlap = await _shiftRepository.HasOverlapAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, null, ct);
        if (hasOverlap)
            throw new InvalidOperationException(
                "Il turno si sovrappone con un altro turno esistente.");

        await CheckVacationConflictAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, null, ct);

        var created = await _shiftRepository.AddAsync(shift, ct);

        // Notifica push al dipendente
        await NotifyEmployeeAsync(
            shift.EmployeeId,
            "📅 Nuovo turno assegnato",
            $"Hai un turno il {shift.StartTime.ToLocalTime():dd/MM} " +
            $"dalle {shift.StartTime.ToLocalTime():HH:mm} " +
            $"alle {shift.EndTime.ToLocalTime():HH:mm}.",
            "Shift", created.Id, ct);

        return created;
    }

    public async Task<Shift> UpdateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        var hasOverlap = await _shiftRepository.HasOverlapAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, ct);
        if (hasOverlap)
            throw new InvalidOperationException(
                "Il turno modificato si sovrappone con un altro turno esistente.");

        await CheckVacationConflictAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, ct);

        var updated = await _shiftRepository.UpdateAsync(shift, ct);

        // Notifica push al dipendente
        await NotifyEmployeeAsync(
            shift.EmployeeId,
            "✏️ Turno modificato",
            $"Il tuo turno del {shift.StartTime.ToLocalTime():dd/MM} è stato modificato: " +
            $"{shift.StartTime.ToLocalTime():HH:mm}–{shift.EndTime.ToLocalTime():HH:mm}.",
            "Shift", updated.Id, ct);

        return updated;
    }

    public async Task<bool> DeleteShiftAsync(int shiftId, CancellationToken ct = default)
    {
        // Recupera il turno prima di eliminarlo per poter notificare il dipendente
        var shift = await _shiftRepository.GetByIdAsync(shiftId, ct);
        if (shift == null) return false;

        var result = await _shiftRepository.DeleteAsync(shiftId, ct);

        if (result)
        {
            await NotifyEmployeeAsync(
                shift.EmployeeId,
                "❌ Turno cancellato",
                $"Il turno del {shift.StartTime.ToLocalTime():dd/MM} " +
                $"({shift.StartTime.ToLocalTime():HH:mm}–{shift.EndTime.ToLocalTime():HH:mm}) " +
                "è stato cancellato.",
                "Shift", shiftId, ct);
        }

        return result;
    }

    // ── Metodi privati ────────────────────────────────────────────

    private async Task CheckVacationConflictAsync(
        int employeeId, DateTime startTime, DateTime endTime,
        int? excludeShiftId, CancellationToken ct)
    {
        var vacations = await _vacationRepository.GetByEmployeeAsync(employeeId, ct);
        var shiftDate = startTime.Date;

        var conflict = vacations.FirstOrDefault(v =>
            v.Status == VacationRequestStatus.Approved &&
            shiftDate >= v.StartDate.Date &&
            shiftDate <= v.EndDate.Date);

        if (conflict != null)
            throw new InvalidOperationException(
                $"Il dipendente è in ferie approvate dal {conflict.StartDate:dd/MM} " +
                $"al {conflict.EndDate:dd/MM/yyyy}. " +
                "Non è possibile assegnare turni in quel periodo.");
    }

    /// <summary>
    /// Recupera il UserId del dipendente e invia la notifica push.
    /// Non lancia eccezioni: un errore push non blocca l'operazione principale.
    /// </summary>
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
