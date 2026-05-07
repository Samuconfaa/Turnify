using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IEmployeeRepository
{
    Task<Employee?> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<System.Collections.Generic.IReadOnlyList<Employee>> GetAllByCompanyIdAsync(int companyId, int? businessId = null, CancellationToken ct = default);
    Task<Employee?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> ExistsByEmailInCompanyAsync(string email, int companyId, CancellationToken ct = default);
    Task<Employee> AddAsync(Employee employee, CancellationToken ct = default);
    Task<Employee> UpdateAsync(Employee employee, CancellationToken ct = default);
}
