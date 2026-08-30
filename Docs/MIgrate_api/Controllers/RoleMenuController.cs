using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/role-menu")]
[Authorize]
public class RoleMenuController : ControllerBase
{
    private readonly RoleMenuRepository _repo;
    public RoleMenuController(RoleMenuRepository repo) => _repo = repo;
    private string CurrentUser => User.FindFirst("unique_name")?.Value ?? "unknown";

    [HttpGet] public async Task<IActionResult> List() => Ok(await _repo.ListAsync());

    [HttpGet("by-role/{roleId:int}")]
    public async Task<IActionResult> ListByRole(int roleId) => Ok(await _repo.ListAsync(roleId));

    [HttpGet("module-access")]
    public async Task<IActionResult> ListModuleAccess() => Ok(await _repo.ListModuleAccessAsync());

    [HttpGet("module-access/by-role/{roleId:int}")]
    public async Task<IActionResult> ListModuleAccessByRole(int roleId) => Ok(await _repo.ListModuleAccessAsync(roleId));

    [HttpGet("restricted-columns/{menuId:int}")]
    public async Task<IActionResult> GetRestrictedColumns(int menuId)
    {
        var roleIdClaim = User.FindFirst("role_id")?.Value;
        if (!int.TryParse(roleIdClaim, out var roleId)) return Ok(Array.Empty<string>());
        return Ok(await _repo.GetRestrictedColumnsAsync(roleId, menuId));
    }

    [HttpGet("restricted-columns/{menuId:int}/for-role/{roleId:int}")]
    public async Task<IActionResult> GetRestrictedColumnsForRole(int menuId, int roleId) => Ok(await _repo.GetRestrictedColumnsAsync(roleId, menuId));

    [HttpPost] public async Task<IActionResult> Save([FromBody] RoleMenuModel model) => Ok(await _repo.SaveAsync(model, CurrentUser));

    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => Ok(await _repo.DeleteAsync(id));
}
