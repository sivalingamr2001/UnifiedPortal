using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JanaticsAdminPortal.API.Repositories;

namespace JanaticsAdminPortal.API.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize(Roles = "SuperAdmin")]
public class SessionsController : ControllerBase
{
    private readonly SessionRepository _repo;
    public SessionsController(SessionRepository repo) => _repo = repo;

    [HttpGet] public async Task<IActionResult> ListActive() => Ok(await _repo.ListActiveAsync());

    [HttpPost("{id:int}/end")]
    public async Task<IActionResult> ForceEnd(int id) => (await _repo.ForceEndAsync(id)) ? NoContent() : NotFound();
}
