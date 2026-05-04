using System.Threading;
using System.Threading.Tasks;

namespace Turnify.Core.Interfaces.Services;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
}
