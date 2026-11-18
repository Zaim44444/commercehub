using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using CommerceHub.Api.Contracts.Products;
using CommerceHub.Api.Data;
using CommerceHub.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Vendor")]
[Route("api/vendor/products")]
public class VendorProductsController(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager
) : ControllerBase
{
    public sealed record ProductResponse(
        int Id,
        string Name,
        string? Description,
        decimal Price,
        int StockQuantity,
        bool IsActive,
        DateTime CreatedAtUtc,
        DateTime? UpdatedAtUtc
    );

    // Read the identity from the validated token, then check current access.
    private async Task<string?> GetCurrentVendorIdAsync()
    {
        var userId = User.FindFirst(
            JwtRegisteredClaimNames.Sub
        )?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var user = await userManager.FindByIdAsync(userId);

        if (
            user is null
            || !user.IsActive
            || !await userManager.IsInRoleAsync(user, "Vendor")
        )
        {
            return null;
        }

        return user.Id;
    }

    // Every product query is restricted to the current vendor.
    private IQueryable<Product> ProductsFor(string vendorId)
    {
        return db.Products
            .AsNoTracking()
            .Where(product => product.VendorId == vendorId);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken
    )
    {
        var vendorId = await GetCurrentVendorIdAsync();

        if (vendorId is null)
        {
            return Forbid();
        }

        var product = new Product
        {
            VendorId = vendorId,
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Products.Add(product);

        await db.SaveChangesAsync(cancellationToken);

        var response = new ProductResponse(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.StockQuantity,
            product.IsActive,
            product.CreatedAtUtc,
            product.UpdatedAtUtc
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            response
        );
    }

    [HttpGet]
    public async Task<IActionResult> Index(
        [FromQuery, Range(1, 1_000_000)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        [FromQuery, StringLength(100)] string? search = null,
        CancellationToken cancellationToken = default
    )
    {
        var vendorId = await GetCurrentVendorIdAsync();

        if (vendorId is null)
        {
            return Forbid();
        }

        var query = ProductsFor(vendorId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(product =>
                product.Name.Contains(term)
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(product => product.CreatedAtUtc)
            .ThenByDescending(product => product.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(product => new ProductResponse(
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.IsActive,
                product.CreatedAtUtc,
                product.UpdatedAtUtc
            ))
            .ToListAsync(cancellationToken);

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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken
    )
    {
        var vendorId = await GetCurrentVendorIdAsync();

        if (vendorId is null)
        {
            return Forbid();
        }

        var product = await ProductsFor(vendorId)
            .Where(product => product.Id == id)
            .Select(product => new ProductResponse(
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.IsActive,
                product.CreatedAtUtc,
                product.UpdatedAtUtc
            ))
            .SingleOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            return NotFound(new
            {
                message = "Product was not found."
            });
        }

        return Ok(product);
    }
}