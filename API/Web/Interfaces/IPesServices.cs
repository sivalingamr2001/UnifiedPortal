namespace PES_LITE.WEB.Interfaces;

public interface IPesServices
{
    Task<IEnumerable<dynamic>> GetDashboardMetricsConsolidatedAsync(
        string custodianName,
        int? orgId,
        string? level5,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetAms1ConsolidatedAsync(
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetItemDetailsByIdAsync(long inventoryItemId, CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetComponentDetailsByItemAsync(int lineId, CancellationToken cancellationToken);

    Task<int> UpdateProdCommitDateAsync(
        IEnumerable<(int LineId, string? RsvSource, string SelectedMonth)> updates,
        CancellationToken cancellationToken);
}
