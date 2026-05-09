using System.Threading.Tasks;

namespace Turnify.Mobile.Services;

public interface IMobilePushService
{
    Task RegisterAsync();
    Task UnregisterAsync();
}
