using System;

namespace Turnify.Core.Models;

public enum UserRole
{
    Admin,
    Employee,
    Manager
}

public enum ContractType
{
    FullTime,
    PartTime,
    Apprenticeship,
    FixedTerm,
    OnCall
}

public enum ShiftStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}

public enum VacationRequestType
{
    Holiday,
    PaidLeave,
    UnpaidLeave,
    SickLeave
}

public enum VacationRequestStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled
}

public enum NotificationType
{
    Info,
    Warning,
    Alert,
    Reminder
}

public enum CheckInMethod
{
    App,
    Web,
    Badge,
    Manual
}
