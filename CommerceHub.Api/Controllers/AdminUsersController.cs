using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using CommerceHub.Api.Data;
using CommerceHub.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager
) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Index(
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        [FromQuery, StringLength(100)] string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        // Confirm the account still has Admin access in the database.
        var currentUserId = User.FindFirst(
            JwtRegisteredClaimNames.Sub
        )?.Value;

        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            return Unauthorized();
        }

        var currentUser = await userManager.FindByIdAsync(currentUserId);

        if (currentUser is null || !currentUser.IsActive)
        {
            return Unauthorized();
        }

        if (!await userManager.IsInRoleAsync(currentUser, "Admin"))
        {
            return Forbid();
        }

        var query = db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(user =>
                user.FullName.Contains(term)
                || (user.Email != null && user.Email.Contains(term))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderByDescending(user => user.CreatedAtUtc)
            .ThenBy(user => user.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(user => new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.IsActive,
                user.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        var userIds = users.Select(user => user.Id).ToArray();

        // Fetch roles for this page together.
        var roleRows = await (
            from userRole in db.Set<IdentityUserRole<string>>()
            join role in db.Set<IdentityRole>()
                on userRole.RoleId equals role.Id
            where userIds.Contains(userRole.UserId)
            select new
            {
                userRole.UserId,
                RoleName = role.Name
            }
        ).ToListAsync(cancellationToken);

        var rolesByUser = roleRows.ToLookup(
            row => row.UserId,
            row => row.RoleName
        );

        var items = users.Select(user => new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.IsActive,
            user.CreatedAtUtc,
            roles = rolesByUser[user.Id]
                .Where(role => role != null)
                .OrderBy(role => role)
                .ToArray()
        });

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            )
        });
    }

    public sealed class UpdateStatusRequest
    {
        [Required]
        public bool? IsActive { get; init; }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        string id,
        [FromBody] UpdateStatusRequest request
    )
    {
        var currentUserId = User.FindFirst(
            JwtRegisteredClaimNames.Sub
        )?.Value;

        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            return Unauthorized();
        }

        var currentUser = await userManager.FindByIdAsync(currentUserId);

        if (currentUser is null || !currentUser.IsActive)
        {
            return Unauthorized();
        }

        if (!await userManager.IsInRoleAsync(currentUser, "Admin"))
        {
            return Forbid();
        }

        if (request.IsActive is not bool isActive)
        {
            return BadRequest(new
            {
                message = "IsActive is required."
            });
        }

        if (id == currentUserId && !isActive)
        {
            return BadRequest(new
            {
                message = "You cannot deactivate your own account."
            });
        }

        var user = await userManager.FindByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message = "Account was not found."
            });
        }

        if (user.IsActive == isActive)
        {
            return Ok(new { user.Id, user.IsActive });
        }

        user.IsActive = isActive;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            if (result.Errors.Any(error => error.Code == "ConcurrencyFailure"))
            {
                return Conflict(new
                {
                    message = "This account changed. Refresh and try again."
                });
            }

            return Problem(
                statusCode: 500,
                detail: "Account status could not be updated."
            );
        }

        return Ok(new { user.Id, user.IsActive });
    }

    
}