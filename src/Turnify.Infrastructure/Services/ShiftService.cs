using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Models;

namespace Turnify.Infrastructure.Services;

public class ShiftService : IShiftService
{
    private readonly IShiftRepository _shiftRepository;

    public ShiftService(IShiftRepository shiftRepository)
    {
        _shiftRepository = shiftRepository;
    }

    public Task<IReadOnlyList<Shift>> GetShiftsAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return _shiftRepository.GetByCompanyAsync(companyId, from, to, ct);
    }

    public Task<IReadOnlyList<Shift>> GetShiftsByEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        return _shiftRepository.GetByEmployeeAsync(employeeId, from, to, ct);
    }

    public async Task<Shift> CreateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        var hasOverlap = await _shiftRepository.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, null, ct);
        if (hasOverlap)
        {
            throw new InvalidOperationException("Il turno si sovrappone con un altro turno esistente.");
        }

        return await _shiftRepository.AddAsync(shift, ct);
    }

    public async Task<Shift> UpdateShiftAsync(Shift shift, CancellationToken ct = default)
    {
        var hasOverlap = await _shiftRepository.HasOverlapAsync(shift.EmployeeId, shift.StartTime, shift.EndTime, shift.Id, ct);
        if (hasOverlap)
        {
            throw new InvalidOperationException("Il turno modificato si sovrappone con un altro turno esistente.");
        }

        return await _shiftRepository.UpdateAsync(shift, ct);
    }

    public Task<bool> DeleteShiftAsync(int shiftId, CancellationToken ct = default)
    {
        return _shiftRepository.DeleteAsync(shiftId, ct);
    }
}
