using CommerceHub.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CommerceHub.Api.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options
) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Configure Identity first, then apply our custom settings.
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");

            entity.Property(user => user.FullName)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(user => user.Email)
                .IsRequired();

            entity.Property(user => user.NormalizedEmail)
                .IsRequired();

            entity.HasIndex(user => user.NormalizedEmail)
                .IsUnique()
                .HasFilter(null);

            entity.Property(user => user.IsActive)
                .HasDefaultValue(true);

            entity.Property(user => user.CreatedAtUtc)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });

        builder.Entity<IdentityRole>()
            .ToTable("Roles");

        builder.Entity<IdentityUserRole<string>>()
            .ToTable("UserRoles");

        builder.Entity<IdentityUserClaim<string>>()
            .ToTable("UserClaims");

        builder.Entity<IdentityRoleClaim<string>>()
            .ToTable("RoleClaims");

        builder.Entity<IdentityUserLogin<string>>(entity =>
        {
            entity.ToTable("UserLogins");

            entity.Property(login => login.LoginProvider)
                .HasMaxLength(128);

            entity.Property(login => login.ProviderKey)
                .HasMaxLength(128);
        });

        builder.Entity<IdentityUserToken<string>>(entity =>
        {
            entity.ToTable("UserTokens");

            entity.Property(token => token.LoginProvider)
                .HasMaxLength(128);

            entity.Property(token => token.Name)
                .HasMaxLength(128);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");

            entity.HasKey(token => token.Id);

            entity.Property(token => token.Id)
                .HasDefaultValueSql("NEWID()");

            entity.Property(token => token.TokenHash)
                .HasColumnType("varchar(64)")
                .IsRequired();

            entity.HasIndex(token => token.TokenHash)
                .IsUnique();

            entity.Property(token => token.CreatedAtUtc)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(token => token.User)
                .WithMany()
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Product>(entity =>
        {
            entity.ToTable("Products", table =>
            {
                table.HasCheckConstraint(
                    "CK_Products_Price_Positive",
                    "[Price] > 0"
                );

                table.HasCheckConstraint(
                    "CK_Products_StockQuantity_NonNegative",
                    "[StockQuantity] >= 0"
                );
            });

            entity.HasKey(product => product.Id);

            entity.Property(product => product.VendorId)
                .HasMaxLength(450)
                .IsRequired();

            entity.Property(product => product.Name)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(product => product.Description)
                .HasMaxLength(2000);

            entity.Property(product => product.Price)
                .HasPrecision(18, 2);

            entity.Property(product => product.StockQuantity)
                .HasDefaultValue(0);

            entity.Property(product => product.IsActive)
                .HasDefaultValue(true);

            entity.Property(product => product.CreatedAtUtc)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(product => product.VendorId);

            entity.HasOne(product => product.Vendor)
                .WithMany()
                .HasForeignKey(product => product.VendorId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}