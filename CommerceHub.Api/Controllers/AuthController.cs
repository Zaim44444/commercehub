using CommerceHub.Api.Contracts.Auth;
using CommerceHub.Api.Data;
using CommerceHub.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using CommerceHub.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace CommerceHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ApplicationDbContext db,
    ILogger<AuthController> logger,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService tokenService
) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var email = request.Email.Trim();

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return Conflict(new
            {
                message = "This email is already registered."
            });
        }

        if (!await roleManager.RoleExistsAsync("Customer"))
        {
            logger.LogError("Customer role is missing.");

            return Problem(
                statusCode: 500,
                detail: "Registration is temporarily unavailable."
            );
        }

        // Both operations succeed together or are rolled back.
        await using var transaction =
            await db.Database.BeginTransactionAsync();

        try
        {
            var user = new ApplicationUser
            {
                FullName = request.FullName.Trim(),
                UserName = email,
                Email = email,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(
                user,
                request.Password
            );

            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed.",
                    errors = createResult.Errors.Select(error => new
                    {
                        error.Code,
                        error.Description
                    })
                });
            }

            var roleResult = await userManager.AddToRoleAsync(
                user,
                "Customer"
            );

            if (!roleResult.Succeeded)
            {
                logger.LogError(
                    "Customer role assignment failed for user {UserId}.",
                    user.Id
                );

                return Problem(
                    statusCode: 500,
                    detail: "Registration could not be completed."
                );
            }

            await transaction.CommitAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Account created successfully.",
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    role = "Customer"
                }
            });
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is SqlException sql
                  && (sql.Number == 2601 || sql.Number == 2627))
        {
            // Handles simultaneous requests using the same email.
            return Conflict(new
            {
                message = "This email is already registered."
            });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(
            request.Email.Trim()
        );

        if (user is null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "Unable to sign in with these credentials."
            });
        }

        // Two-factor login needs a separate verification flow.
        // Prevent password-only login if it is enabled.
        if (user.TwoFactorEnabled)
        {
            return Unauthorized(new
            {
                message = "Two-factor sign-in is not available yet."
            });
        }

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true
        );

        if (!result.Succeeded)
        {
            return Unauthorized(new
            {
                message = "Unable to sign in with these credentials."
            });
        }

        var roles = await userManager.GetRolesAsync(user);
        var token = tokenService.CreateToken(user, roles);

        return Ok(new
        {
            token.AccessToken,
            tokenType = "Bearer",
            token.ExpiresAtUtc,
            user = new
            {
                user.Id,
                user.FullName,
                user.Email,
                roles
            }
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst(
            JwtRegisteredClaimNames.Sub
        )?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var user = await userManager.FindByIdAsync(userId);

        if (user is null || !user.IsActive)
        {
            return Unauthorized();
        }

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            roles
        });
    }
}