using Dapper;
using DynamicTransaction.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Server.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;
    private const string JwtSecret = "supersecretkey_janatics_unified_suite_2026"; // In production, load this from configuration

    public AuthController(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { Message = "Username and password are required." });
        }

        try
        {
            await using var connectionWrapper = _connectionFactory.CreateConnection();
            
            // Query user details from JAN_USER_MASTER
            const string userQuery = "SELECT USER_ID, USER_NAME, ROLE_ID, PASSWORD_HASH, PASSWORD_SALT FROM JAN_USER_MASTER WHERE USER_NAME = @UserName AND STATUS = 'ACTIVE'";
            var user = await connectionWrapper.Connection.QueryFirstOrDefaultAsync<UserDto>(userQuery, new { UserName = request.UserName });

            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid username or password." });
            }

            // Verify password hash
            bool isPasswordValid = VerifyPassword(request.Password, user.PASSWORD_HASH, user.PASSWORD_SALT);
            if (!isPasswordValid)
            {
                return Unauthorized(new { Message = "Invalid username or password." });
            }

            // Query role name
            const string roleQuery = "SELECT ROLE_NAME FROM JAN_ROLES WHERE ROLE_ID = @RoleId";
            var roleName = await connectionWrapper.Connection.QueryFirstOrDefaultAsync<string>(roleQuery, new { RoleId = user.ROLE_ID }) ?? "User";

            // Generate JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.OutboundClaimTypeMap.Clear(); // Disable mapping standard claims to soap URIs

            var key = Encoding.ASCII.GetBytes(JwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("sub", user.USER_ID.ToString()),
                    new Claim("unique_name", user.USER_NAME),
                    new Claim("role", roleName),
                    new Claim("role_id", user.ROLE_ID.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                Token = tokenString,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(7).ToString("o")
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Authentication failed.", Details = ex.Message });
        }
    }

    private static bool VerifyPassword(string inputPassword, string storedHash, string storedSalt)
    {
        // For seed user 'admin' with plain salt and hash checks
        if (storedSalt == "dummysalt_salt" && storedHash == "dummysalt_hash")
        {
            return inputPassword == "password";
        }

        try
        {
            // Try parsing salt as base64 string for ISO standard PBKDF2 verification
            byte[] saltBytes = Convert.FromBase64String(storedSalt);
            using var pbkdf2 = new Rfc2898DeriveBytes(inputPassword, saltBytes, 10000, HashAlgorithmName.SHA256);
            byte[] hashBytes = pbkdf2.GetBytes(32);
            string calculatedHash = Convert.ToBase64String(hashBytes);
            return calculatedHash == storedHash;
        }
        catch
        {
            // Fallback: SHA256 hashing if salt is plain text
            using var sha = SHA256.Create();
            var saltedInput = inputPassword + storedSalt;
            var hashedBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(saltedInput));
            var calculatedHash = Convert.ToBase64String(hashedBytes);
            return calculatedHash == storedHash;
        }
    }

    public sealed class LoginRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    private sealed class UserDto
    {
        public int USER_ID { get; set; }
        public string USER_NAME { get; set; } = string.Empty;
        public int ROLE_ID { get; set; }
        public string PASSWORD_HASH { get; set; } = string.Empty;
        public string PASSWORD_SALT { get; set; } = string.Empty;
    }
}
