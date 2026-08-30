using DynamicTransaction.Interfaces;
using PES_LITE.WEB.Interfaces;
using System.Dynamic;
using System.Data;

namespace PES_LITE.WEB.Services;

public class PesServices(IDynamicQueryExecutor queryExecutor, ILogger<PesServices> logger) : IPesServices
{
    private readonly IDynamicQueryExecutor _queryExecutor = queryExecutor;
    private readonly ILogger<PesServices> _logger = logger;

    public async Task<IEnumerable<dynamic>> GetDashboardMetricsConsolidatedAsync(
            string custodianName,
            int? orgId,
            string? level5,
            CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT 
                MAX((SELECT COUNT(1) FROM jan_item_master_tab WHERE ams_flag = 'AMS1')) AS AMS1_Total,
                MAX((SELECT COUNT(*) FROM jan_item_master_tab WHERE NVL(ams_flag, 'AMS2') = 'AMS2' AND new_item_type = 'FG' AND SOURCE_ID IS NULL AND ORGANIZATION_ID IN (524, 464, 444, 484, 504))) AS AMS2_Total,

                SUM(CASE WHEN rsv_source = 'ORDER' THEN ROUND(COALESCE(TO_BE_MFG, 0)) ELSE 0 END) AS SO_QTY,
                SUM(CASE WHEN rsv_source = 'BIN_RSV' THEN ROUND(COALESCE(TO_BE_MFG, 0)) ELSE 0 END) AS BIN_QTY,
                SUM(CASE WHEN rsv_source IN ('ORDER', 'BIN_RSV') THEN ROUND(COALESCE(TO_BE_MFG, 0)) ELSE 0 END) AS Demand,

                COUNT(DISTINCT CASE WHEN AMS_CAT = 'AMS1' THEN INVENTORY_ITEM_ID END) AS activeAms1Items,
                COUNT(DISTINCT CASE WHEN AMS_CAT = 'AMS2' THEN INVENTORY_ITEM_ID END) AS activeAms2Items,

                SUM(CASE WHEN CONSTRAINT_T = 'CONSTRAINT' THEN ROUND(COALESCE(TO_BE_MFG, 0)) ELSE 0 END) AS reqQtySumForConstraint,
                SUM(CASE WHEN CONSTRAINT_T != 'CONSTRAINT' OR CONSTRAINT_T IS NULL THEN ROUND(COALESCE(TO_BE_MFG, 0)) ELSE 0 END) AS reqQtySumForUnConstraint,

                SUM(CASE WHEN CONSTRAINT_T = 'CONSTRAINT' THEN ROUND(COALESCE(EXCEPTION_QTY, 0)) ELSE 0 END) AS exceptionQtySumForConstraint,
                SUM(CASE WHEN CONSTRAINT_T != 'CONSTRAINT' OR CONSTRAINT_T IS NULL THEN ROUND(COALESCE(EXCEPTION_QTY, 0)) ELSE 0 END) AS exceptionQtySumForUnConstraint

            FROM JAN_SP_TARGET_MONTH_GUIDE_TAB main
            WHERE PROD_COMMIT_MONTH IS NULL 
              AND HO_TARGET_MONTH IS NOT NULL
              AND (:OrgId IS NULL OR ORGANIZATION_ID = :OrgId)
              AND (:CustodianName IS NULL OR UPPER(CUSTODIAN_NAME) LIKE UPPER(:CustodianName))
              AND (:Level5 IS NULL OR EXISTS (
                    SELECT 1 
                    FROM JAN_ITEM_CATEGORY cat
                    WHERE cat.INVENTORY_ITEM_ID = main.INVENTORY_ITEM_ID 
                      AND cat.ORGANIZATION_ID = main.ORGANIZATION_ID
                      AND cat.LEVEL_5 = :Level5
              ))";

        var paramValue = string.IsNullOrWhiteSpace(custodianName)
            ? null
            : $"%{custodianName.Trim().ToUpperInvariant()}%";

        var cleanLevel5 = string.IsNullOrWhiteSpace(level5) ? null : level5.Trim();

        var parameters = new
        {
            CustodianName = paramValue,
            OrgId = orgId,
            Level5 = cleanLevel5
        };

        try
        {
            return await _queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning(ex, "GetDashboardMetricsConsolidatedAsync was canceled for Custodian: {CustodianName}", custodianName);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDashboardMetricsConsolidatedAsync failed for Custodian: {CustodianName}. Query: {Sql}", custodianName, sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetAms1ConsolidatedAsync(
        CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT 
                JAN_ORGCODE(ORGANIZATION_ID)ORG,
                ORGANIZATION_ID,
                ORDERED_ITEM,
                INVENTORY_ITEM_ID, 
                (select description from mtl_system_items where INVENTORY_ITEM_ID=a.INVENTORY_ITEM_ID and rownum=1)Description,
                ams_cat, 
                SUM(TO_BE_MFG) as req_qty, 
                SUM(EXCEPTION_QTY) as EXCEPTION_QTY, 
                CUSTODIAN_NAME,
                CONSTRAINT_T as Constraint,
                case when rsv_source = 'ORDER' then sum(TO_BE_MFG) else 0 end SO_QTY, 
                case when rsv_source = 'BIN_RSV' then sum(TO_BE_MFG) else 0 end BIN_QTY, 
                (select count(1) from jan_item_master_tab where ams_flag='AMS1') as AMS1_Total,
                (select count(*) 
                from jan_item_master_tab 
                where nvl(ams_flag, 'AMS2')='AMS2' and new_item_type='FG' AND SOURCE_ID IS NULL AND ORGANIZATION_ID IN (524, 464, 444, 484, 504))AMS2_Total,
                (
                    SELECT
                        SUM(
                            CASE
                                WHEN to_number(TO_CHAR(target_date,'YYYYMM') ) < to_number(TO_CHAR(SYSDATE,'YYYYMM') )   THEN requirement - receipt_qty - cancelled_qty
                                ELSE 0
                            END
                        )
                    FROM
                        jan_cylinder_ds_lines
                    WHERE
                            requirement + receipt_qty + cancelled_qty > 0
                        AND
                            demand_source = 'MKTG'
                        AND
                            inventory_item_id = a.inventory_item_id
                        AND
                            ORGANIZATION_ID = a.ORGANIZATION_ID
                ) upto_last_month,
                (
                    SELECT
                        SUM(
                            CASE
                                WHEN to_number(TO_CHAR(target_date,'YYYYMM') ) = to_number(TO_CHAR(SYSDATE,'YYYYMM') )   THEN requirement - receipt_qty - cancelled_qty
                                ELSE 0
                            END
                        )
                    FROM
                        jan_cylinder_ds_lines
                    WHERE
                            requirement + receipt_qty + cancelled_qty > 0
                        AND
                            demand_source = 'MKTG'
                        AND
                            inventory_item_id = a.inventory_item_id
                        AND
                            ORGANIZATION_ID = a.ORGANIZATION_ID
                ) this_month,
                (
                    SELECT
                        SUM(
                            CASE
                                WHEN to_number(TO_CHAR(target_date,'YYYYMM') ) > to_number(TO_CHAR(SYSDATE,'YYYYMM') )   THEN requirement - receipt_qty - cancelled_qty
                                ELSE 0
                            END
                        )
                    FROM
                        jan_cylinder_ds_lines
                    WHERE
                            requirement + receipt_qty + cancelled_qty > 0
                        AND
                            demand_source = 'MKTG'
                        AND
                            inventory_item_id = a.inventory_item_id
                        AND
                            ORGANIZATION_ID = a.ORGANIZATION_ID
                ) next_month_onwards,
                (SELECT DISTINCT LEVEL_5  FROM JAN_ITEM_CATEGORY WHERE  level_5 is not null and INVENTORY_ITEM_ID=a.INVENTORY_ITEM_ID AND ORGANIZATION_ID=a.ORGANIZATION_ID)LEVEL_5,
                (select nvl(OCQ_QUANTITY, 0) from jan_item_master_tab where INVENTORY_ITEM_ID=a.INVENTORY_ITEM_ID AND ORGANIZATION_ID=a.ORGANIZATION_ID)OCQ_QTY
            FROM JAN_SP_TARGET_MONTH_GUIDE_tab a
            WHERE PROD_COMMIT_MONTH IS NULL AND HO_TARGET_MONTH IS NOT NULL
            GROUP BY
                JAN_ORGCODE(ORGANIZATION_ID),
                ORGANIZATION_ID,
                ORDERED_ITEM, 
                INVENTORY_ITEM_ID, 
                CUSTODIAN_NAME,
                ams_cat, 
                CONSTRAINT_T,
                rsv_source
            ORDER BY EXCEPTION_QTY ASC";

        try
        {
            return await _queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: null,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning(ex, "GetAms1ConsolidatedAsync execution was canceled by the client request thread.");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetAms1ConsolidatedAsync critically failed while processing aggregation query. SQL Executed: {Sql}", sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetItemDetailsByIdAsync(
        long inventoryItemId,
        CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT 
                REGION,
                SP_WK_NO,
                HEADER_ID,
                LINE_ID,
                ORDERED_ITEM,
                INVENTORY_ITEM_ID,
                ORGANIZATION_ID,
                CUSTOMER_CATEGORGY,
                ORD_FF_DT,
                RSV_SOURCE,
                TO_BE_MFG,
                EXCESS_QTY,
                CONSTRAINT_T,
                CUSTOMER_ID,
                ORDER_NUMBER,
                AMS_CAT,
                BRANCH_TARGET_MONTH,
                HO_TARGET_MONTH,
                PROD_COMMIT_MONTH,
                EXCEPTION_QTY
            FROM JAN_SP_TARGET_MONTH_GUIDE_TAB 
            WHERE ho_target_month is not null and PROD_COMMIT_MONTH is null
                and INVENTORY_ITEM_ID = :InventoryItemId
            ORDER BY ORD_FF_DT ASC";

        var parameters = new { InventoryItemId = inventoryItemId };

        try
        {
            return await _queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning(ex, "GetItemDetailsByIdAsync execution thread was canceled for ID: {Id}", inventoryItemId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetItemDetailsByIdAsync critically failed for ID: {Id}. Query: {Sql}", inventoryItemId, sql);
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetComponentDetailsByItemAsync(
        int lineId,
        CancellationToken cancellationToken)
    {
        if (lineId <= 0)
        {
            return [];
        }

        const string sql = @"select * from JAN_M2O_SHORTAGE_V where line_id = :LineId";

        var parameters = new { LineId = lineId };

        try
        {
            return await _queryExecutor.QueryAsync<dynamic>(
                sql: sql,
                parameters: parameters,
                transaction: null,
                connectionString: null,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning(ex, "GetComponentDetailsByItemAsync was canceled for line ID: {LineId}", lineId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetComponentDetailsByItemAsync failed for line ID: {LineId}. Query: {Sql}", lineId, sql);
            throw;
        }
    }

    public async Task<int> UpdateProdCommitDateAsync(
        IEnumerable<(int LineId, string? RsvSource, string SelectedMonth)> updates,
        CancellationToken cancellationToken)
    {
        var updateList = updates?.Where(x => x.LineId > 0 && !string.IsNullOrWhiteSpace(x.SelectedMonth)).ToList() ?? [];
        if (updateList.Count == 0)
        {
            return 0;
        }

        var updateStatements = updateList.Select((update, index) => new
        {
            Index = index,
            update.LineId,
            update.RsvSource,
            update.SelectedMonth
        }).ToList();

        const string targetGuideSql = @"
            UPDATE JAN_SP_TARGET_MONTH_GUIDE_TAB
            SET PROD_COMMIT_MONTH = :ProdCommitDate, PROD_COMMIT_FLAG = 'Y'
            WHERE LINE_ID = :LineId
              AND (:RsvSource IS NULL OR RSV_SOURCE = :RsvSource)";

        const string wkLinesSql = @"
            UPDATE JAN_SP_WK_LINES
            SET PROD_COMMIT_MONTH = :ProdCommitDate, PROD_COMMIT_DATE = SYSDATE, 
                PROD_COMMIT_STATUS = 'MANUAL', PROD_COMMIT_FLAG = 'Y'
            WHERE LINE_ID = :LineId
              AND (:RsvSource IS NULL OR RSV_SOURCE = :RsvSource)";

        try
        {
            return await _queryExecutor.ExecuteInTransactionAsync(
                async tx =>
                {
                    int affectedRows = 0;
                    foreach (var update in updateStatements)
                    {
                        var parameters = new
                        {
                            ProdCommitDate = NormalizeYearMonth(update.SelectedMonth),
                            LineId = update.LineId,
                            RsvSource = string.IsNullOrWhiteSpace(update.RsvSource) ? null : update.RsvSource
                        };

                        affectedRows += await _queryExecutor.ExecuteAsync(
                            sql: targetGuideSql,
                            parameters: parameters,
                            transaction: tx,
                            cancellationToken: cancellationToken);

                        affectedRows += await _queryExecutor.ExecuteAsync(
                            sql: wkLinesSql,
                            parameters: parameters,
                            transaction: tx,
                            cancellationToken: cancellationToken);
                    }

                    _logger.LogInformation("Updated {Count} rows across target guide and work-line tables.", affectedRows);
                    return affectedRows;
                },
                isolationLevel: IsolationLevel.ReadCommitted,
                cancellationToken: cancellationToken);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning(ex, "UpdateProdCommitDateAsync was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateProdCommitDateAsync failed while updating {RowCount} rows.", updateList.Count);
            throw;
        }
    }

    private static string NormalizeYearMonth(string yearMonth)
    {
        if (string.IsNullOrWhiteSpace(yearMonth))
        {
            throw new ArgumentException("Selected month is required.", nameof(yearMonth));
        }

        var normalized = yearMonth.Trim();
        if (normalized.Length == 6 && int.TryParse(normalized, out _))
        {
            var year = int.Parse(normalized[..4]);
            var month = int.Parse(normalized[4..]);
            if (month is < 1 or > 12)
            {
                throw new ArgumentException($"Invalid month value '{normalized}'. Expected YYYYMM with month 01-12.", nameof(yearMonth));
            }

            return normalized;
        }

        if (DateTime.TryParse(normalized, out var parsedDate))
        {
            return parsedDate.ToString("yyyyMM");
        }

        throw new ArgumentException($"Invalid selected month value '{yearMonth}'. Expected YYYYMM or a valid date.", nameof(yearMonth));
    }
 }
