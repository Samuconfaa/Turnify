using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Turnify.Core.Interfaces.Services;

namespace Turnify.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config) => _config = config;

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var host     = _config["Smtp:Host"]     ?? "smtp.gmail.com";
        var port     = _config.GetValue<int>("Smtp:Port", 587);
        var user     = _config["Smtp:User"]     ?? string.Empty;
        var pass     = _config["Smtp:Password"] ?? string.Empty;
        var fromAddr = _config["Smtp:From"]     ?? user;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl   = true,
            Credentials = new NetworkCredential(user, pass)
        };

        using var msg = new MailMessage(fromAddr, to, subject, htmlBody)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(msg, ct);
    }
}
