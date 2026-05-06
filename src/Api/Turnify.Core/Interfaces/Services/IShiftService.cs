using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface IShiftService
{
    Task<IReadOnlyList<Shift>> GetShiftsAsync(int companyId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<Shift?> GetShiftByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> GetShiftsByEmployeeAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<Shift> CreateShiftAsync(Shift shift, CancellationToken ct = default);
    Task<Shift> UpdateShiftAsync(Shift shift, CancellationToken ct = default);
    Task<bool> DeleteShiftAsync(int shiftId, CancellationToken ct = default);
    Task<IReadOnlyList<Shift>> CreateRecurringShiftsAsync(Shift baseShift, int weeks, CancellationToken ct = default);
}
