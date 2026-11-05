using CommerceHub.Api.Data;
using CommerceHub.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using System.IdentityModel.Tokens.Jwt;
using CommerceHub.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection is missing."
    );

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 10;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.AllowedForNewUsers = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders()
    .AddSignInManager();

    
builder.Services.AddDataProtection();
builder.Services.AddControllers();


var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Jwt:Issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Jwt:Audience is missing.");

var signingKeyBytes = Convert.FromBase64String(jwtKey);

if (signingKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key must contain at least 32 random bytes."
    );
}

builder.Services.AddScoped<JwtTokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,
            RequireExpirationTime = true,

            ValidateIssuerSigningKey = true,
            RequireSignedTokens = true,
            IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),
            ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },

            NameClaimType = "name",
            RoleClaimType = "role",
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // Reject tokens if the account has since been disabled/deleted.
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?
                    .FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                {
                    context.Fail("Invalid account.");
                    return;
                }

                var users = context.HttpContext.RequestServices
                    .GetRequiredService<UserManager<ApplicationUser>>();

                var user = await users.FindByIdAsync(userId);

                if (user is null || !user.IsActive)
                {
                    context.Fail("Invalid account.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ExpoDevelopment", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081",
                "http://127.0.0.1:8081",
                "http://localhost:8082",
                "http://127.0.0.1:8082"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed development roles. Database migrations must already be applied.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();

    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<ApplicationUser>>();

    foreach (var roleName in new[] { "Customer", "Admin", "Vendor" })
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            continue;
        }

        var result = await roleManager.CreateAsync(
            new IdentityRole(roleName)
        );

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                string.Join(
                    "; ",
                    result.Errors.Select(error => error.Description)
                )
            );
        }
    }

    // Temporary: grant seller access to your existing test account.
    var sellerEmail = "zaim@example.com";

    var sellerUser = await userManager.FindByEmailAsync(sellerEmail);

    if (sellerUser is null)
    {
        throw new InvalidOperationException(
            "Seller test account was not found. Check sellerEmail."
        );
    }

    if (!await userManager.IsInRoleAsync(sellerUser, "Vendor"))
    {
        var result = await userManager.AddToRoleAsync(
            sellerUser,
            "Vendor"
        );

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                string.Join(
                    "; ",
                    result.Errors.Select(error => error.Description)
                )
            );
        }
    }
}

app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseCors("ExpoDevelopment");
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => "CommerceHub API is reachable")
    .AllowAnonymous();

app.Run();