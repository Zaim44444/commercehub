namespace CommerceHub.Api.Models;

public class RefreshToken
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public required string TokenHash { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime? RevokedAtUtc { get; set; }
}
