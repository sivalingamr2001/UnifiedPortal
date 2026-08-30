using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserRepository _users;
    private readonly SessionRepository _sessions;
    private readonly RoleRepository _roles;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(UserRepository users, SessionRepository sessions, RoleRepository roles, IConfiguration config, ILogger<AuthController> logger)
    {
        _users = users;
        _sessions = sessions;
        _roles = roles;
        _config = config;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Login name and password are required." });

        var creds = await _users.GetLoginCredentialsAsync(request.UserName);
        const string genericError = "Invalid login name or password.";

        if (creds == null)
        {
            _logger.LogWarning("Login failed: unknown or inactive login name {UserName}", request.UserName);
            return Unauthorized(new { message = genericError });
        }

        if (!PasswordHasher.Verify(request.Password, creds.PasswordHash, creds.PasswordSalt))
        {
            _logger.LogWarning("Login failed: bad password for {UserName}", request.UserName);
            return Unauthorized(new { message = genericError });
        }

        var now = DateTime.Now;
        //if (creds.LoginWorkdaysOnly == "Y" && (now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday))
        //    return Unauthorized(new { message = "Login is not permitted on weekends for this account." });

        if (creds.LoginWorkdaysOnly == "N")
            return Unauthorized(new { message = "Login is not permitted on weekends for this account." });


        if (TimeSpan.TryParse(creds.LoginFromTime, out var fromTime) && TimeSpan.TryParse(creds.LoginToTime, out var toTime))
        {
            var nowTime = now.TimeOfDay;
            var withinWindow = fromTime <= toTime ? nowTime >= fromTime && nowTime <= toTime : nowTime >= fromTime || nowTime <= toTime;
            if (!withinWindow)
                return Unauthorized(new { message = "Login is not permitted at this time for this account." });
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!string.IsNullOrWhiteSpace(creds.AllowedIps) && clientIp != null)
        {
            var allowed = creds.AllowedIps.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            if (allowed.Length > 0 && !allowed.Contains(clientIp))
                return Unauthorized(new { message = "Login is not permitted from this network for this account." });
        }

        var jti = Guid.NewGuid().ToString();
        var expiryMinutes = _config.GetValue<int>("Jwt:ExpiryMinutes", 60);
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes);
        // The database compares session expiry against SYSDATE, which is
        // the DB SERVER's LOCAL time, not UTC - sending it a UTC value
        // made sessions look already-expired the moment they were checked,
        // on any DB server running ahead of UTC (e.g. IST, +05:30). The
        // JWT's 'exp' claim below stays correctly UTC-based - that's a
        // separate, independent expiry check, unaffected by this.
        var expiresAtLocalForDb = DateTime.Now.AddMinutes(expiryMinutes);

        var sessionResult = await _sessions.TryCreateSessionAsync(creds.UserId, jti, expiresAtLocalForDb, clientIp, Request.Headers["User-Agent"].ToString());
        if (!sessionResult.Allowed)
        {
            _logger.LogInformation("Login denied by session policy for user {UserId}: {Message}", creds.UserId, sessionResult.Message);
            return Conflict(new { message = sessionResult.Message });
        }

        var token = await BuildJwtAsync(creds, jti, expiresAtUtc);
        return Ok(new LoginResponse { Token = token, ExpiresAtUtc = expiresAtUtc });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
        if (!string.IsNullOrEmpty(jti)) await _sessions.EndSessionAsync(jti);
        return NoContent();
    }

    private async Task<string> BuildJwtAsync(LoginCredentialsRow creds, string jti, DateTime expiresAtUtc)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        // 1. Fetch the role
        var role = await _roles.GetAsync(creds.RoleId);
        var roleName = role?.RoleName.Replace(" ", "") ?? "User";

        // 2. Fetch the user details and validate existence
        var user = await _users.GetAsync(creds.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {creds.UserId} was not found.");
        }

        // 3. Bind both credentials and UserModel data to claims
        var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, creds.UserId.ToString()),
        new(JwtRegisteredClaimNames.Jti, jti),
        new("unique_name", creds.UserName),
        new(ClaimTypes.Role, roleName),
        new("role_id", creds.RoleId.ToString()),
        
        // Custom claims pulled directly from your UserModel
        new("employee_id", user.EmployeeId),
        new("full_name", user.FullName),
        new("user_type", user.UserType),
        new("security_level", user.SecurityLevel.ToString()),
        new("primary_email", user.PrimaryEmail ?? ""),
        new("timezone", user.Timezone)
    };

        // 4. Generate the token
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
