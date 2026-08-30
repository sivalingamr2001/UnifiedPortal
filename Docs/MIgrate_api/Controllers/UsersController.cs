using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserRepository _repo;
    private readonly SessionRepository _sessions;
    public UsersController(UserRepository repo, SessionRepository sessions) { _repo = repo; _sessions = sessions; }
    private string CurrentUser => User.FindFirst("unique_name")?.Value ?? "unknown";
    private int CurrentUserId
    {
        get
        {
            var raw = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(raw, out var id))
                throw new InvalidOperationException("Authenticated request is missing a valid user identity claim.");
            return id;
        }
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _repo.ListAsync(CurrentUserId));

    [HttpGet("verify-employee/{employeeId}")]
    public async Task<IActionResult> VerifyEmployee(string employeeId) => Ok(await _repo.VerifyEmployeeAsync(employeeId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) { var u = await _repo.GetAsync(id); return u is null ? NotFound() : Ok(u); }

    [HttpPost] public async Task<IActionResult> Create([FromBody] UserModel model) => Ok(await _repo.CreateAsync(model, CurrentUser));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserModel model)
    {
        var result = await _repo.UpdateAsync(id, model, CurrentUser, CurrentUserId);
        if (result.Success && model.Status == "INACTIVE") await _sessions.EndAllForUserAsync(id);
        return Ok(result);
    }

    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
    {
        var result = await _repo.ChangePasswordAsync(id, request.NewPassword, CurrentUser);
        if (result.Success) await _sessions.EndAllForUserAsync(id);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _repo.DeleteAsync(id, CurrentUser, CurrentUserId);
        if (result.Success) await _sessions.EndAllForUserAsync(id);
        return Ok(result);
    }
}
