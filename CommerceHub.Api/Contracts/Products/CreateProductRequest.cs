using System.ComponentModel.DataAnnotations;

namespace CommerceHub.Api.Contracts.Products;

public sealed class CreateProductRequest : IValidatableObject
{
    [Required]
    [StringLength(150)]
    public required string Name { get; init; }

    [StringLength(2000)]
    public string? Description { get; init; }

    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public required decimal Price { get; init; }

    [Range(0, int.MaxValue)]
    public required int StockQuantity { get; init; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext
    )
    {
        if (decimal.Round(Price, 2) != Price)
        {
            yield return new ValidationResult(
                "Price must have no more than two decimal places.",
                new[] { nameof(Price) }
            );
        }
    }
}