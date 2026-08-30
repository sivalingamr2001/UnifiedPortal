using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PES_LITE.WEB.Interfaces;

public interface ICommodityServices
{
    Task<IEnumerable<dynamic>> GetDashboardMetricsConsolidateAsync(
        string custodianName,
        int? orgId,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetAllCommodityAsync(
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetAllSupplyAsync(
        int organizationId,
        string itemNo,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetPendingPOSupplyAsync(
        int organizationId,
        string itemNo,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetPOInReceivingSupplyAsync(
        int organizationId,
        string itemNo,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetJobPendingSupplyAsync(
        int organizationId,
        string itemNo,
        CancellationToken cancellationToken);

    Task<IEnumerable<dynamic>> GetAllcomponentvsproductAsync(
        int organizationId,
        string componentNo,
        CancellationToken cancellationToken);
}
