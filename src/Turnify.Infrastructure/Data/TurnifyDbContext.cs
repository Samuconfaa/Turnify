using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Turnify.Core.Models;

namespace Turnify.Infrastructure.Data;

public class TurnifyDbContext : DbContext
{
    public TurnifyDbContext(DbContextOptions<TurnifyDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<VacationRequest> VacationRequests => Set<VacationRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AttendanceLog> AttendanceLogs => Set<AttendanceLog>();
    public DbSet<DeviceToken> DeviceTokens => Set<DeviceToken>();
    public DbSet<AppErrorLog> AppErrorLogs => Set<AppErrorLog>();
    public DbSet<Invite> Invites => Set<Invite>();
    public DbSet<ShiftSwapRequest> ShiftSwapRequests => Set<ShiftSwapRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.CompanyId);
        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.CompanyId, u.Username }).IsUnique()
            .HasFilter("`Username` IS NOT NULL");
        modelBuilder.Entity<User>()
            .Property(u => u.Role).HasConversion<string>();

        // Companies
        modelBuilder.Entity<Company>()
            .HasIndex(c => c.Slug).IsUnique();

        // Businesses
        modelBuilder.Entity<Business>()
            .HasIndex(b => b.CompanyId);

        // Employees
        modelBuilder.Entity<Employee>()
            .HasIndex(e => new { e.CompanyId, e.Email }).IsUnique();
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.UserId);
        modelBuilder.Entity<Employee>()
            .Property(e => e.ContractType).HasConversion<string>();

        // Shifts
        modelBuilder.Entity<Shift>()
            .HasIndex(s => new { s.EmployeeId, s.StartTime });
        modelBuilder.Entity<Shift>()
            .HasIndex(s => s.CompanyId);
        modelBuilder.Entity<Shift>()
            .Property(s => s.Status).HasConversion<string>();

        // VacationRequests
        modelBuilder.Entity<VacationRequest>()
            .HasIndex(v => new { v.EmployeeId, v.StartDate });
        modelBuilder.Entity<VacationRequest>()
            .HasIndex(v => v.Status);
        modelBuilder.Entity<VacationRequest>()
            .Property(v => v.Type).HasConversion<string>();
        modelBuilder.Entity<VacationRequest>()
            .Property(v => v.Status).HasConversion<string>();

        // Notifications
        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.RecipientUserId, n.IsRead });
        modelBuilder.Entity<Notification>()
            .Property(n => n.Type).HasConversion<string>();

        // AttendanceLogs
        modelBuilder.Entity<AttendanceLog>()
            .HasIndex(a => new { a.EmployeeId, a.CheckInTime });
        modelBuilder.Entity<AttendanceLog>()
            .Property(a => a.CheckInMethod).HasConversion<string>();

        // DeviceTokens — indice su UserId+IsActive per query veloci
        modelBuilder.Entity<DeviceToken>()
            .HasIndex(t => new { t.UserId, t.IsActive });
        modelBuilder.Entity<DeviceToken>()
            .HasIndex(t => t.Token).IsUnique();
        modelBuilder.Entity<DeviceToken>()
            .Property(t => t.Platform).HasConversion<string>();

        // ShiftSwapRequests
        modelBuilder.Entity<ShiftSwapRequest>()
            .HasIndex(s => s.RequestingEmployeeId);
        modelBuilder.Entity<ShiftSwapRequest>()
            .HasIndex(s => s.RequestedEmployeeId);
        modelBuilder.Entity<ShiftSwapRequest>()
            .Property(s => s.Status).HasConversion<string>();

        // AppErrorLogs
        modelBuilder.Entity<AppErrorLog>()
            .HasIndex(e => new { e.CompanyId, e.OccurredAt });
        modelBuilder.Entity<AppErrorLog>()
            .HasIndex(e => e.UserId);
        modelBuilder.Entity<AppErrorLog>()
            .HasIndex(e => e.OccurredAt);

        // Converte tutti i DateTime in UTC
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(dateTimeConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(nullableDateTimeConverter);
            }
        }
    }
}
