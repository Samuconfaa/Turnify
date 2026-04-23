using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Turnify.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly bool _isDevelopment;

    public GlobalExceptionMiddleware(RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _isDevelopment = env.IsDevelopment();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 500;

        var response = new
        {
            type   = "https://turnify.it/errors/internal",
            title  = "Errore interno del server",
            status = 500,
            // Show real error detail only in development / non-production
            detail = _isDevelopment
                ? $"{ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}"
                : "Si è verificato un errore. Contatta il supporto."
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
