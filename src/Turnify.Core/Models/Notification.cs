using System;

namespace Turnify.Core.Models;

public class Notification
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int RecipientUserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public DateTime CreatedAt { get; set; }
}
