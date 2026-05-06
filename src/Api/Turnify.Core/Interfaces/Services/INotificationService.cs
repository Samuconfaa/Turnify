using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Models;

namespace Turnify.Core.Interfaces.Services;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetNotificationsAsync(int userId, CancellationToken ct = default);
    Task<bool> MarkAsReadAsync(int notificationId, CancellationToken ct = default);
    Task<bool> SendNotificationAsync(Notification notification, CancellationToken ct = default);
}
