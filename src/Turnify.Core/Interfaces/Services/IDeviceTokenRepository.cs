using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Repositories;

public interface IDeviceTokenRepository
{
    Task<IReadOnlyList<DeviceToken>> GetActiveByUserIdAsync(int userId, CancellationToken ct = default);
    Task<DeviceToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task<DeviceToken> AddAsync(DeviceToken deviceToken, CancellationToken ct = default);
    Task<DeviceToken> UpdateAsync(DeviceToken deviceToken, CancellationToken ct = default);
    Task DeactivateAsync(string token, CancellationToken ct = default);
}
