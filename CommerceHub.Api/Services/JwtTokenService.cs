using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CommerceHub.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace CommerceHub.Api.Services;

public class JwtTokenService(IConfiguration configuration)
{
    public AccessTokenResult CreateToken(
        ApplicationUser user,
        IEnumerable<string> roles)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is missing.");

        var issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("Jwt:Issuer is missing.");

        var audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("Jwt:Audience is missing.");

        var now = DateTime.UtcNow;
        var expiresAtUtc = now.AddMinutes(15);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(
                JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(now).ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64
            ),
            new("name", user.FullName)
        };

        claims.AddRange(
            roles.Select(role => new Claim("role", role))
        );

        var signingKey = new SymmetricSecurityKey(
            Convert.FromBase64String(key)
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: expiresAtUtc,
            signingCredentials: new SigningCredentials(
                signingKey,
                SecurityAlgorithms.HmacSha256
            )
        );

        return new AccessTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAtUtc
        );
    }
}

public record AccessTokenResult(
    string AccessToken,
    DateTime ExpiresAtUtc
);