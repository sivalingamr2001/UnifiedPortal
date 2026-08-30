using Microsoft.AspNetCore.Mvc;
using PES_LITE.WEB.Interfaces;
using PES_LITE.WEB.Models;

namespace PES_LITE.WEB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PesController(IPesServices service) : ControllerBase
{
    private readonly IPesServices _service = service;

    [HttpGet("dashboard-metrics")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetDashboardMetricsConsolidated(
        [FromQuery] string custodianName = "",
        [FromQuery] int? orgId = null,
        [FromQuery] string? level5 = "",
        CancellationToken cancellationToken = default)
    {
        var result = await _service.GetDashboardMetricsConsolidatedAsync(custodianName, orgId, level5, cancellationToken);
        return Ok(result);
    }

    [HttpGet("pes-consolidated")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAms1Consolidated(CancellationToken cancellationToken)
    {
        var result = await _service.GetAms1ConsolidatedAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("item-details/{inventoryItemId}")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetItemDetails(
    long inventoryItemId,
    CancellationToken cancellationToken)
    {
        try
        {
            var result = await _service.GetItemDetailsByIdAsync(inventoryItemId, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server database lookup failure: {ex.Message}");
        }
    }

    [HttpGet("component-details/{lineId:int}")]
    [ProducesResponseType(typeof(IEnumerable<dynamic>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetComponentDetails(
        int lineId,
        CancellationToken cancellationToken)
    {
        if (lineId <= 0)
        {
            return BadRequest("Line ID must be a positive integer.");
        }

        try
        {
            var result = await _service.GetComponentDetailsByItemAsync(lineId, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server database lookup failure: {ex.Message}");
        }
    }

    [HttpPost("update-prod-commit-date")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateProdCommitDate(
        [FromBody] UpdateProdCommitDateRequest request,
        CancellationToken cancellationToken)
    {
        if (request?.Updates is null || request.Updates.Count == 0)
        {
            return BadRequest("At least one update item is required.");
        }

        var normalizedUpdates = request.Updates
            .Where(x => x.LineId > 0 && !string.IsNullOrWhiteSpace(x.SelectedMonth))
            .Select(x => (x.LineId, x.RsvSource, x.SelectedMonth.Trim()))
            .ToList();

        if (normalizedUpdates.Count == 0)
        {
            return BadRequest("Each update must include a positive line id and a selected month.");
        }

        try
        {
            var updatedRows = await _service.UpdateProdCommitDateAsync(normalizedUpdates, cancellationToken);
            return Ok(new { updatedRows });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server database update failure: {ex.Message}");
        }
    }
}
