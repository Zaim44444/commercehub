using Microsoft.AspNetCore.Identity;

namespace CommerceHub.Api.Models;

public class ApplicationUser : IdentityUser
{
    public required string FullName { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }
}