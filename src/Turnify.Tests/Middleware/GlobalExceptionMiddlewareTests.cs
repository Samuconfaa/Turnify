using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Turnify.Api.Middleware;
using Xunit;

namespace Turnify.Tests.Middleware;

public class GlobalExceptionMiddlewareTests
{
    private static (DefaultHttpContext context, MemoryStream body) CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        var body    = new MemoryStream();
        context.Response.Body = body;
        return (context, body);
    }

    private static GlobalExceptionMiddleware CreateMiddleware(
        RequestDelegate next, bool isDevelopment = false)
    {
        var loggerMock = new Mock<ILogger<GlobalExceptionMiddleware>>();
        var envMock    = new Mock<IWebHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName)
               .Returns(isDevelopment ? "Development" : "Production");
        return new GlobalExceptionMiddleware(next, loggerMock.Object, envMock.Object);
    }

    // ── Caso senza eccezione ───────────────────────────────────────

    [Fact]
    public async Task InvokeAsync_NoException_CallsNextDelegate()
    {
        var nextCalled = false;
        var next       = new RequestDelegate(_ => { nextCalled = true; return Task.CompletedTask; });
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        nextCalled.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_NoException_DoesNotModifyStatusCode()
    {
        var next       = new RequestDelegate(_ => Task.CompletedTask);
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        ctx.Response.StatusCode.Should().Be(200); // default ASP.NET Core
    }

    // ── Caso con eccezione ─────────────────────────────────────────

    [Fact]
    public async Task InvokeAsync_ExceptionThrown_Returns500StatusCode()
    {
        var next       = new RequestDelegate(_ => throw new InvalidOperationException("boom"));
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        ctx.Response.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task InvokeAsync_ExceptionThrown_SetsApplicationJsonContentType()
    {
        var next       = new RequestDelegate(_ => throw new Exception("errore"));
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        ctx.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_ExceptionThrown_ResponseBodyIsValidJson()
    {
        var next       = new RequestDelegate(_ => throw new Exception("test"));
        var middleware = CreateMiddleware(next);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        var act  = () => JsonDocument.Parse(json);
        act.Should().NotThrow();
    }

    [Fact]
    public async Task InvokeAsync_ExceptionThrown_BodyContainsStatus500()
    {
        var next       = new RequestDelegate(_ => throw new Exception("test"));
        var middleware = CreateMiddleware(next);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        using var doc = JsonDocument.Parse(json);
        doc.RootElement.GetProperty("status").GetInt32().Should().Be(500);
    }

    // ── Differenze Development vs Production ──────────────────────

    [Fact]
    public async Task InvokeAsync_DevelopmentEnv_IncludesExceptionDetail()
    {
        var next       = new RequestDelegate(_ => throw new ArgumentException("messaggio dettagliato"));
        var middleware = CreateMiddleware(next, isDevelopment: true);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        json.Should().Contain("messaggio dettagliato");
    }

    [Fact]
    public async Task InvokeAsync_ProductionEnv_HidesExceptionDetail()
    {
        var next       = new RequestDelegate(_ => throw new ArgumentException("informazione riservata"));
        var middleware = CreateMiddleware(next, isDevelopment: false);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        json.Should().NotContain("informazione riservata");
    }

    [Fact]
    public async Task InvokeAsync_ProductionEnv_ReturnsGenericMessage()
    {
        var next       = new RequestDelegate(_ => throw new Exception("qualsiasi errore"));
        var middleware = CreateMiddleware(next, isDevelopment: false);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        // Il serializzatore scrive 'è' come è — verifica sul valore decodificato
        using var doc   = JsonDocument.Parse(json);
        var detail = doc.RootElement.GetProperty("detail").GetString();
        detail.Should().Contain("verificato un errore");
    }

    [Fact]
    public async Task InvokeAsync_ExceptionThrown_BodyContainsExpectedFields()
    {
        var next       = new RequestDelegate(_ => throw new Exception("test"));
        var middleware = CreateMiddleware(next, isDevelopment: false);
        var (ctx, body) = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(body).ReadToEndAsync();
        using var doc  = JsonDocument.Parse(json);
        var root = doc.RootElement;
        root.TryGetProperty("type",   out _).Should().BeTrue();
        root.TryGetProperty("title",  out _).Should().BeTrue();
        root.TryGetProperty("status", out _).Should().BeTrue();
        root.TryGetProperty("detail", out _).Should().BeTrue();
    }

    // ── Tipi di eccezione diversi ──────────────────────────────────

    [Fact]
    public async Task InvokeAsync_NullReferenceException_StillReturns500()
    {
        var next       = new RequestDelegate(_ => throw new NullReferenceException());
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        ctx.Response.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task InvokeAsync_AsyncException_StillReturns500()
    {
        var next = new RequestDelegate(async _ =>
        {
            await Task.Yield();
            throw new InvalidOperationException("async boom");
        });
        var middleware = CreateMiddleware(next);
        var (ctx, _)   = CreateHttpContext();

        await middleware.InvokeAsync(ctx);

        ctx.Response.StatusCode.Should().Be(500);
    }
}
