using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly RoleRepository _repo;
    public RolesController(RoleRepository repo) => _repo = repo;
    private string CurrentUser => User.FindFirst("unique_name")?.Value ?? "unknown";

    [HttpGet] public async Task<IActionResult> List() => Ok(await _repo.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) { var r = await _repo.GetAsync(id); return r is null ? NotFound() : Ok(r); }

    [HttpPost] public async Task<IActionResult> Create([FromBody] RoleModel model) => Ok(await _repo.CreateAsync(model, CurrentUser));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RoleModel model) => Ok(await _repo.UpdateAsync(id, model, CurrentUser));

    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => Ok(await _repo.DeleteAsync(id));
}
