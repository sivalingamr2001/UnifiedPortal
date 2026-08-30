using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Models;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/menus")]
[Authorize]
public class MenusController : ControllerBase
{
    private readonly MenuRepository _repo;
    public MenusController(MenuRepository repo) => _repo = repo;
    private string CurrentUser => User.FindFirst("unique_name")?.Value ?? "unknown";

    [HttpGet] public async Task<IActionResult> List([FromQuery] int? moduleId) => Ok(await _repo.ListAsync(moduleId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) { var m = await _repo.GetAsync(id); return m is null ? NotFound() : Ok(m); }

    [HttpPost] public async Task<IActionResult> Create([FromBody] MenuModel model) => Ok(await _repo.CreateAsync(model, CurrentUser));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] MenuModel model) => Ok(await _repo.UpdateAsync(id, model, CurrentUser));

    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => Ok(await _repo.DeleteAsync(id));
}
