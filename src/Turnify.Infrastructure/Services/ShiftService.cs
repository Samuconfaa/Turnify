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
    private readonly IShiftRepository _shiftRepository;
    private readonly IVacationRepository _vacationRepository;

    public ShiftService(IShiftRepository shiftRepository, IVacationRepository vacationRepository)
    {
        _shiftRepository    = shiftRepository;
        _vacationRepository = vacationRepository;
    }

    public Task<IReadOnlyList<Shift>> GetShiftsAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default)
        => _shiftRepository.GetByCompanyAsync(companyId, from, to, ct);

    public Task<Shift?> GetShiftByIdAsync(int id, CancellationToken ct = default)
        => _shiftRepository.GetByIdAsync(id, ct);

    public Task<IReadOnlyList<Shift>> GetShiftsByEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
        => _shiftRepository.GetByEmployeeAsync(employeeId, from, to, ct);

    public async Task<Shift> CreateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        // Check shift overlap
        var hasOverlap = await _shiftRepository.HasOverlapAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, null, ct);
        if (hasOverlap)
            throw new InvalidOperationException("Il turno si sovrappone con un altro turno esistente.");

        // Check approved vacation
        await CheckVacationConflictAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, null, ct);

        return await _shiftRepository.AddAsync(shift, ct);
    }

    public async Task<Shift> UpdateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        var hasOverlap = await _shiftRepository.HasOverlapAsync(
            shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, ct);
        if (hasOverlap)
            throw new InvalidOperationException("Il turno modificato si sovrappone con un altro turno esistente.");

        await CheckVacationConflictAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, ct);

        return await _shiftRepository.UpdateAsync(shift, ct);
    }

    public Task<bool> DeleteShiftAsync(int shiftId, CancellationToken ct = default)
        => _shiftRepository.DeleteAsync(shiftId, ct);

    // Throws if the employee has an approved vacation that overlaps the shift date
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
                $"Il dipendente è in ferie approvate dal {conflict.StartDate:dd/MM} al {conflict.EndDate:dd/MM/yyyy}. " +
                "Non è possibile assegnare turni in quel periodo.");
    }
}
