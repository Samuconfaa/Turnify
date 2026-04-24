using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Core.Interfaces.Services;

namespace Turnify.Api.Controllers;

public class RegisterTokenRequest
{
    /// <summary>Token FCM (Android) o APNs (iOS) del dispositivo.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>"android" oppure "ios"</summary>
    public string Platform { get; set; } = "android";
}

[ApiController]
[Route("api/device-tokens")]
[Authorize]
public class DeviceTokensController : ControllerBase
{
    private readonly IPushNotificationService _pushService;

    public DeviceTokensController(IPushNotificationService pushService)
    {
        _pushService = pushService;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out int id) ? id : 0;
    }

    /// <summary>
    /// Registra o aggiorna il token FCM/APNs del dispositivo corrente.
    /// Chiamare all'avvio dell'app (dopo il login) e quando FCM emette un nuovo token.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Register(
        [FromBody] RegisterTokenRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest(new { message = "Token obbligatorio." });

        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        await _pushService.RegisterTokenAsync(userId, request.Token, request.Platform, ct);
        return NoContent(); // 204
    }

    /// <summary>
    /// Deregistra il token corrente (chiamare al logout).
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> Unregister(
        [FromBody] RegisterTokenRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest(new { message = "Token obbligatorio." });

        await _pushService.UnregisterTokenAsync(request.Token, ct);
        return NoContent();
    }
}
