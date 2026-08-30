using DynamicTransaction.Interfaces;
using PES_LITE.WEB.Interfaces;
using Microsoft.Extensions.Logging;

namespace PES_LITE.WEB.Services;

public class CommodityServices(IDynamicQueryExecutor queryExecutor, ILogger<CommodityServices> logger) : ICommodityServices
{
    public async Task<IEnumerable<dynamic>> GetDashboardMetricsConsolidateAsync(
       string custodianName,
       int? orgId,
       CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT
                s.shortage_track_1a,
                s.shortage_track_1b,
                s.shortage_track_2,
                s.overdue_track_1a,
                s.overdue_track_1b,
                s.overdue_track_2,
                m.total_track_1a,
                m.total_track_1b,
                m.total_track_2
            FROM (
                SELECT
                    COUNT(CASE WHEN VENDOR_CATEGORY = 'Track 1a' THEN 1 END) AS shortage_track_1a,
                    COUNT(CASE WHEN VENDOR_CATEGORY = 'Track 1b' THEN 1 END) AS shortage_track_1b,
                    COUNT(CASE WHEN VENDOR_CATEGORY = 'Track 2'  THEN 1 END) AS shortage_track_2,
        
                    SUM(CASE WHEN VENDOR_CATEGORY = 'Track 1a' AND (NVL(UPTO_MONTH_MINUS_TWO,0) + NVL(LAST_MONTH,0)) > 0 THEN 1 ELSE 0 END) AS overdue_track_1a,
                    SUM(CASE WHEN VENDOR_CATEGORY = 'Track 1b' AND (NVL(UPTO_MONTH_MINUS_TWO,0) + NVL(LAST_MONTH,0)) > 0 THEN 1 ELSE 0 END) AS overdue_track_1b,
                    SUM(CASE WHEN VENDOR_CATEGORY = 'Track 2'  AND (NVL(UPTO_MONTH_MINUS_TWO,0) + NVL(LAST_MONTH,0)) > 0 THEN 1 ELSE 0 END) AS overdue_track_2
                FROM jan_mrp_frozen_shortage_v
                WHERE (:OrgId IS NULL OR ORGANIZATION_ID = (:OrgId))
            ) s
            CROSS JOIN (
                SELECT 
                    COUNT(CASE WHEN VENDOR_CATEGORY = 'Track 1a' THEN 1 END) AS total_track_1a,
                    COUNT(CASE WHEN VENDOR_CATEGORY = 'Track 1b' THEN 1 END) AS total_track_1b,
                    COUNT(CASE WHEN NVL(VENDOR_CATEGORY, 'Track 2') = 'Track 2'  THEN 1 END) AS total_track_2
                FROM jan_item_master_tab
                WHERE (ORGANIZATION_ID IN (524, 464, 444, 504, 484, 505, 644) OR ORGANIZATION_ID = (:OrgId))
            ) m
        ";

        var parameters = new
        {
            OrgId = orgId
        };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetDashboardMetricsConsolidatedAsync was canceled for Custodian: {CustodianName}", custodianName);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetDashboardMetricsConsolidatedAsync failed for Custodian: {CustodianName}.", custodianName);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetAllCommodityAsync(CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM jan_mrp_frozen_shortage_v ORDER BY UPTO_MONTH_MINUS_TWO DESC";

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: null,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetAllCommodity execution was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAllCommodity failed. Query: {Sql}", sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetAllSupplyAsync(int organizationId, string itemNo, CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM JAN_ALL_SUPPLY_V WHERE ORGANIZATION_ID = :OrganizationId AND ITEM_NO = :ItemNo";
        var parameters = new { OrganizationId = organizationId, ItemNo = itemNo };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetAllSupply execution was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAllSupply failed. Query: {Sql}", sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetAllcomponentvsproductAsync(int organizationId, string componentNo, CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM jan_mrp_component_vs_product_v WHERE ORGANIZATION_ID = :OrganizationId AND COMPONENT_NO = :ComponentNo";
        var parameters = new { OrganizationId = organizationId, ComponentNo = componentNo };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetAllcomponentvsproduct execution was canceled for ItemNo: {ItemNo} in Org: {OrganizationId}", componentNo, organizationId);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAllcomponentvsproduct failed for ItemNo: {ItemNo} in Org: {OrganizationId}. Query: {Sql}", componentNo, organizationId, sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetPendingPOSupplyAsync(int organizationId, string itemNo, CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM jan_po_pending_supply_v WHERE org = jan_orgCode(:OrganizationId) AND ITEM_NO = :ItemNo";
        var parameters = new { OrganizationId = organizationId, ItemNo = itemNo };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetPendingPOSupply execution was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetPendingPOSupply failed. Query: {Sql}", sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetPOInReceivingSupplyAsync(int organizationId, string itemNo, CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM jan_po_in_receiving_supply_v WHERE org = jan_orgCode(:OrganizationId) AND ITEM_NO = :ItemNo";
        var parameters = new { OrganizationId = organizationId, ItemNo = itemNo };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetPOInReceivingSupply execution was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetPOInReceivingSupply failed. Query: {Sql}", sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetJobPendingSupplyAsync(int organizationId, string itemNo, CancellationToken cancellationToken)
    {
        const string sql = "SELECT * FROM jan_job_pending_supply_v WHERE org = jan_orgCode(:OrganizationId) AND ITEM_NO = :ItemNo";
        var parameters = new { OrganizationId = organizationId, ItemNo = itemNo };

        try
        {
            return await queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "GetJobPendingSupply execution was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetJobPendingSupply failed. Query: {Sql}", sql);
            throw;
        }
    }
}
