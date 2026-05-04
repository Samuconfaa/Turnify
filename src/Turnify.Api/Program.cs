using Microsoft.EntityFrameworkCore;
using Turnify.Infrastructure.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Turnify.Core.Interfaces.Services;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Infrastructure.Services;
using Turnify.Infrastructure.Repositories;
using Turnify.Api.Middleware;
using DotNetEnv;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Turnify.Api.Validators;

Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "TurnifyCors";

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

var corsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? ["https://samuconfa.it", "https://www.samuconfa.it"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(corsOrigins)
              .WithHeaders("Content-Type", "Authorization", "X-Requested-With")
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title       = "Turnify API",
        Version     = "v1",
        Description = "API per la gestione turni Turnify"
    });
});

var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<TurnifyDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<TurnifyDbContext>("database");

var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = builder.Configuration["Jwt:Issuer"],
        ValidAudience            = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();

// ── Rate limiting ────────────────────────────────────────────────
builder.Services.AddRateLimiter(opts =>
{
    // Policy stretta per auth (10 req/min per IP)
    opts.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
            {
                PermitLimit          = 10,
                Window               = TimeSpan.FromMinutes(1),
                SegmentsPerWindow    = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit           = 0
            }));

    // Policy stretta per errorlogs (non autenticato, aperto al pubblico)
    opts.AddPolicy("errorlogs", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
            {
                PermitLimit          = 20,
                Window               = TimeSpan.FromMinutes(1),
                SegmentsPerWindow    = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit           = 0
            }));

    // Rate limiter globale: 120 req/min per IP su tutti gli endpoint
    opts.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
            {
                PermitLimit          = 120,
                Window               = TimeSpan.FromMinutes(1),
                SegmentsPerWindow    = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit           = 0
            }));

    opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// HttpClient per FcmPushNotificationService
builder.Services.AddHttpClient<FcmPushNotificationService>();

// ── Services ─────────────────────────────────────────────────────
builder.Services.AddScoped<IEmailService,             SmtpEmailService>();
builder.Services.AddScoped<IAuthService,              AuthService>();
builder.Services.AddScoped<IShiftService,             ShiftService>();
builder.Services.AddScoped<IVacationService,          VacationService>();
builder.Services.AddScoped<IDashboardService,         DashboardService>();
builder.Services.AddScoped<IPushNotificationService,  FcmPushNotificationService>();

// ── Repositories ─────────────────────────────────────────────────
builder.Services.AddScoped<IShiftRepository,       ShiftRepository>();
builder.Services.AddScoped<IUserRepository,        UserRepository>();
builder.Services.AddScoped<ICompanyRepository,     CompanyRepository>();
builder.Services.AddScoped<IVacationRepository,    VacationRepository>();
builder.Services.AddScoped<IEmployeeRepository,    EmployeeRepository>();
builder.Services.AddScoped<IBusinessRepository,    BusinessRepository>();
builder.Services.AddScoped<IDeviceTokenRepository,  DeviceTokenRepository>();
builder.Services.AddScoped<IAttendanceRepository,   AttendanceRepository>();
builder.Services.AddScoped<IAppErrorLogRepository,  AppErrorLogRepository>();
builder.Services.AddScoped<IShiftSwapRepository,    ShiftSwapRepository>();

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UsePathBase("/turnify");

app.UseCors(CorsPolicy);

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
        c.SwaggerEndpoint("/turnify/swagger/v1/swagger.json", "Turnify API v1"));
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status    = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy",
            timestamp = DateTime.UtcNow
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
});

app.Run();

// Punto di entry esposto per WebApplicationFactory nei test di integrazione
public partial class Program { }
