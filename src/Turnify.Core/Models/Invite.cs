using System;

namespace Turnify.Core.Models;

public class Invite
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public int? UsedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
