using System.ComponentModel.DataAnnotations;

namespace CommerceHub.Api.Contracts.Auth;

public class RegisterRequest
{
    [Required]
    [StringLength(150)]
    public required string FullName { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public required string Email { get; set; }

    [Required]
    [StringLength(128, MinimumLength = 10)]
    public required string Password { get; set; }

    [Required]
    [Compare(nameof(Password),
        ErrorMessage = "Passwords do not match.")]
    public required string ConfirmPassword { get; set; }
}