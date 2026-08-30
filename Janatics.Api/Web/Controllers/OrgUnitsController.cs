using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/org-units")]
[Authorize]
public class OrgUnitsController : ControllerBase
{
    private readonly OrgUnitRepository _repo;
    public OrgUnitsController(OrgUnitRepository repo) => _repo = repo;

    [HttpGet("operating-units")]
    public async Task<IActionResult> ListOperatingUnits() => Ok(await _repo.ListOperatingUnitsAsync());

    [HttpGet("organizations")]
    public async Task<IActionResult> ListOrganizations([FromQuery] int operatingUnit) => Ok(await _repo.ListOrganizationsAsync(operatingUnit));
}
