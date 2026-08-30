using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/modules")]
[Authorize]
public class ModulesController : ControllerBase
{
    private readonly ModuleRepository _repo;
    public ModulesController(ModuleRepository repo) => _repo = repo;
    private string CurrentUser => User.FindFirst("unique_name")?.Value ?? "unknown";

    [HttpGet] public async Task<IActionResult> List() => Ok(await _repo.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) { var m = await _repo.GetAsync(id); return m is null ? NotFound() : Ok(m); }

    [HttpPost] public async Task<IActionResult> Create([FromBody] ModuleModel model) => Ok(await _repo.CreateAsync(model, CurrentUser));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ModuleModel model) => Ok(await _repo.UpdateAsync(id, model, CurrentUser));

    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => Ok(await _repo.DeleteAsync(id));
}
