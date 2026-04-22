using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IEmployeeRepository
{
    Task<Employee?> GetByUserIdAsync(int userId, CancellationToken ct = default);
}
