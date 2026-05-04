using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IAttendanceRepository
{
    Task<AttendanceLog?> GetTodayByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<System.Collections.Generic.IReadOnlyList<AttendanceLog>> GetByEmployeeInRangeAsync(int employeeId, System.DateTime from, System.DateTime to, CancellationToken ct = default);
    Task<System.Collections.Generic.IReadOnlyList<AttendanceLog>> GetByCompanyInRangeAsync(int companyId, System.DateTime from, System.DateTime to, CancellationToken ct = default);
    Task<AttendanceLog> AddAsync(AttendanceLog log, CancellationToken ct = default);
    Task<AttendanceLog> UpdateAsync(AttendanceLog log, CancellationToken ct = default);
}
