using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Repositories;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/org-units")]
    [Authorize]
    public class OrgUnitsController : ControllerBase
    {
        private readonly OrgUnitRepository _repo;

        public OrgUnitsController(OrgUnitRepository repo)
        {
            _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        }

        [HttpGet("operating-units")]
        public async Task<IActionResult> ListOperatingUnits()
        {
            try
            {
                var result = await _repo.ListOperatingUnitsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to list operating units.", details = ex.Message });
            }
        }

        [HttpGet("organizations")]
        public async Task<IActionResult> ListOrganizations([FromQuery] int operatingUnit)
        {
            try
            {
                var result = await _repo.ListOrganizationsAsync(operatingUnit);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to list organizations.", details = ex.Message });
            }
        }
    }
}
