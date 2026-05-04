using System;

namespace Turnify.Mobile.Services;

public static class CacheKeys
{
    public const string Employees   = "employees_list";
    public const string Dashboard   = "dashboard_summary";
    public const string Profile     = "user_profile";
    public const string ShiftSwaps  = "shift_swaps";

    public static string ShiftsWeek(DateTime weekStart)
        => $"shifts_week_{weekStart:yyyy_MM_dd}";
}
