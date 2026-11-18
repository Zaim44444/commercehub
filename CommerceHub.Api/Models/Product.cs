namespace CommerceHub.Api.Models;

public class Product
{
    public int Id { get; set; }

    public required string VendorId { get; set; }

    public ApplicationUser Vendor { get; set; } = null!;

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
}