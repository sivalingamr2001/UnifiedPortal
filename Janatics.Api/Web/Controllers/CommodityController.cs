using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PES_LITE.WEB.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PES_LITE.WEB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommodityController(ICommodityServices service) : ControllerBase
{
    [HttpGet("dashboard-consolidated")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetDashboardMetricsConsolidate(
        [FromQuery] string? custodianName,
        [FromQuery] int? orgId,
        CancellationToken cancellationToken)
    {
        var result = await service.GetDashboardMetricsConsolidateAsync(custodianName ?? string.Empty, orgId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("commodity-consolidated")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllCommodity(CancellationToken cancellationToken)
    {
        var result = await service.GetAllCommodityAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("all-supply")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllSupply(
        [FromQuery] int organizationId,
        [FromQuery] string itemNo,
        CancellationToken cancellationToken)
    {
        var result = await service.GetAllSupplyAsync(organizationId, itemNo, cancellationToken);
        return Ok(result);
    }

    [HttpGet("pending-po-supply")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPendingPOSupply(
        [FromQuery] int organizationId,
        [FromQuery] string itemNo,
        CancellationToken cancellationToken)
    {
        var result = await service.GetPendingPOSupplyAsync(organizationId, itemNo, cancellationToken);
        return Ok(result);
    }

    [HttpGet("po-in-receiving-supply")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPOInReceivingSupply(
        [FromQuery] int organizationId,
        [FromQuery] string itemNo,
        CancellationToken cancellationToken)
    {
        var result = await service.GetPOInReceivingSupplyAsync(organizationId, itemNo, cancellationToken);
        return Ok(result);
    }

    [HttpGet("job-pending-supply")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetJobPendingSupply(
        [FromQuery] int organizationId,
        [FromQuery] string itemNo,
        CancellationToken cancellationToken)
    {
        var result = await service.GetJobPendingSupplyAsync(organizationId, itemNo, cancellationToken);
        return Ok(result);
    }

    [HttpGet("component-vs-product")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllComponentVsProduct(
        [FromQuery] int organizationId,
        [FromQuery] string componentNo,
        CancellationToken cancellationToken)
    {
        var result = await service.GetAllcomponentvsproductAsync(organizationId, componentNo, cancellationToken);
        return Ok(result);
    }
}
