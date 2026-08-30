using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/user-access-rights")]
[Authorize]
public class UserAccessRightsController : ControllerBase
{
    private readonly UserAccessRightsRepository _repo;
    private readonly OrgUnitRepository _orgUnits;
    public UserAccessRightsController(UserAccessRightsRepository repo, OrgUnitRepository orgUnits) { _repo = repo; _orgUnits = orgUnits; }
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

    private async Task<int> CountTotalOrganizationsAsync()
    {
        var operatingUnits = await _orgUnits.ListOperatingUnitsAsync();
        var total = 0;
        foreach (var ou in operatingUnits) total += (await _orgUnits.ListOrganizationsAsync(ou.OperatingUnit)).Count();
        return total;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var rows = (await _repo.ListAsync(CurrentUserId)).ToList();
        var total = await CountTotalOrganizationsAsync();
        foreach (var r in rows) r.TotalOrgUnits = total;
        return Ok(rows);
    }

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var rights = await _repo.GetByUserAsync(CurrentUserId, userId);
        if (rights is null) return NotFound();
        rights.TotalOrgUnits = await CountTotalOrganizationsAsync();
        return Ok(rights);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] UserAccessRightsModel model) =>
        Ok(await _repo.SaveAsync(model, CurrentUser, CurrentUserId));

    [HttpDelete("by-user/{userId:int}")]
    public async Task<IActionResult> DeleteAllForUser(int userId) =>
        Ok(await _repo.DeleteAllForUserAsync(userId, CurrentUserId));
}
