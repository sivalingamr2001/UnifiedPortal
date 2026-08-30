using Microsoft.AspNetCore.Mvc;

namespace CustomerComplaintApi.Controllers
{
    // Minimal base controller. This is a brand-new project with no login screen yet,
    // so IsAuthenticated is stubbed to `true` for now — every request passes.
    //
    // When you build real auth, wire it like this:
    //   1. On login, do: HttpContext.Session.SetInt32("UserId", user.Id);
    //   2. Change IsAuthenticated below to check that session key is present.
    // Everything else (controllers checking `if (!IsAuthenticated) return Unauthorized(...)`)
    // will keep working unchanged.
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected bool IsAuthenticated => true; // TODO: replace with real session check once login exists

        protected int? CurrentUserId =>
            HttpContext.Session.GetInt32("UserId");
    }
}
