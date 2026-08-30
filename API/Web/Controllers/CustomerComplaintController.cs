using System.Data;
using Microsoft.AspNetCore.Mvc;
using CustomerComplaintApi.Data;
using CustomerComplaintApi.Models;

namespace CustomerComplaintApi.Controllers
{
    [ApiController]
    [Route("api/customercomplaint")]
    public class CustomerComplaintController : ControllerBase
    {
        private readonly DbHelper _db;
        private bool IsAuthenticated => true;

        public CustomerComplaintController(DbHelper db)
        {
            _db = db;
        }

        // ------------------------------------------------------------
        // GET api/customercomplaint/summary?orgId=103
        // Powers the 5 KPI cards + the SLA gauge
        // ------------------------------------------------------------
        [HttpGet("summary")]
        public IActionResult GetSummary(
            [FromQuery] int orgId = 103,
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null)
        {
            if (!IsAuthenticated) return Unauthorized(new { Message = "Session expired. Please log in again." });
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
                return BadRequest("From and To dates are required.");

            DateTime from = DateTime.Parse(fromDate);
            DateTime to = DateTime.Parse(toDate);

            var ps = new[]
            {
                new OracleParam("orgId", orgId),
                new OracleParam("fromDate", from),
                new OracleParam("toDate", to)
            };

            var sql = @"WITH periods AS (
    SELECT
        DATE(@fromDate) AS cur_start,
        DATE(@toDate) AS cur_end,
        DATE_SUB(DATE(@fromDate), INTERVAL 7 DAY) AS prev_start,
        DATE_SUB(DATE(@toDate), INTERVAL 7 DAY) AS prev_end
),
base AS (
    SELECT c.CCRDT, c.CLOSE_DT, c.TARGET_COMP_DT, c.ITEM_NO, c.WEEK_SALE_QTY,
           CASE WHEN DATE(c.CCRDT) >= p.cur_start  AND DATE(c.CCRDT) <= p.cur_end  THEN 'CUR'
                WHEN DATE(c.CCRDT) >= p.prev_start AND DATE(c.CCRDT) <= p.prev_end THEN 'PREV'
           END AS PERIOD
    FROM JAN_SERVICE_CCR_zoho c
    CROSS JOIN periods p
    WHERE c.ORG_ID = @orgId
),
item_orders AS (
    SELECT 
        b.PERIOD,
        SUM(io.QTY) AS TOTAL_DELIVERED
    FROM (SELECT DISTINCT PERIOD, ITEM_NO FROM base WHERE PERIOD IS NOT NULL) b
    JOIN (
        SELECT ITEM_NO, MAX(WEEK_SALE_QTY) AS QTY
        FROM JAN_SERVICE_CCR_zoho
        WHERE ORG_ID = @orgId
        GROUP BY ITEM_NO
    ) io ON b.ITEM_NO = io.ITEM_NO
    GROUP BY b.PERIOD
)
SELECT
    b.PERIOD,
    COUNT(*)                                                                                    AS TOTAL_COMPLAINTS,
    SUM(CASE WHEN b.CLOSE_DT IS NOT NULL AND DATE(b.CLOSE_DT) <= b.TARGET_COMP_DT THEN 1 ELSE 0 END)    AS SOLVED_WITHIN_SLA,
    SUM(CASE WHEN b.CLOSE_DT IS NULL AND (b.TARGET_COMP_DT IS NULL OR b.TARGET_COMP_DT >= CURDATE()) THEN 1 ELSE 0 END) AS OPEN_WITHIN_SLA,
    SUM(CASE WHEN b.CLOSE_DT IS NULL AND b.TARGET_COMP_DT < CURDATE() THEN 1 ELSE 0 END)     AS OPEN_BREACHED_SLA,
    COALESCE(io.TOTAL_DELIVERED, 0)                                                             AS ORDERS_DELIVERED
FROM base b
LEFT JOIN item_orders io ON b.PERIOD = io.PERIOD
WHERE b.PERIOD IS NOT NULL
GROUP BY b.PERIOD, io.TOTAL_DELIVERED";

            DataTable dt = _db.ExecuteQuery(sql, ps);
            var byPeriod = new Dictionary<string, DataRow>();
            foreach (DataRow r in dt.Rows) byPeriod[r["PERIOD"].ToString()!] = r;

            DataRow? cur = byPeriod.GetValueOrDefault("CUR");
            DataRow? prev = byPeriod.GetValueOrDefault("PREV");

            int curTotal = DbHelper.Val<int>(cur!, "TOTAL_COMPLAINTS");
            int curSolved = DbHelper.Val<int>(cur!, "SOLVED_WITHIN_SLA");
            int curOpenOk = DbHelper.Val<int>(cur!, "OPEN_WITHIN_SLA");
            int curBreached = DbHelper.Val<int>(cur!, "OPEN_BREACHED_SLA");
            int curOrders = DbHelper.Val<int>(cur!, "ORDERS_DELIVERED");

            int prevTotal = DbHelper.Val<int>(prev!, "TOTAL_COMPLAINTS");
            int prevSolved = DbHelper.Val<int>(prev!, "SOLVED_WITHIN_SLA");
            int prevOpenOk = DbHelper.Val<int>(prev!, "OPEN_WITHIN_SLA");
            int prevBreached = DbHelper.Val<int>(prev!, "OPEN_BREACHED_SLA");
            int prevOrders = DbHelper.Val<int>(prev!, "ORDERS_DELIVERED");

            double curRate = curOrders > 0 ? Math.Round(curTotal * 100.0 / curOrders, 2) : 0;
            double prevRate = prevOrders > 0 ? Math.Round(prevTotal * 100.0 / prevOrders, 2) : 0;

            double curSlaPerf = curTotal > 0 ? Math.Round(curSolved * 100.0 / curTotal, 1) : 0;
            double prevSlaPerf = prevTotal > 0 ? Math.Round(prevSolved * 100.0 / prevTotal, 1) : 0;

            double Delta(int c, int p) => p == 0 ? 0 : Math.Round((c - p) * 10.0 / p, 1);

            var summary = new ComplaintDashboardSummary
            {
                AsOf = DateTime.Now,
                TotalComplaints = new ComplaintKpiCard { Value = curTotal, LastWtdValue = prevTotal, DeltaPct = Delta(curTotal, prevTotal) },
                SolvedWithinSla = new ComplaintKpiCard
                {
                    Value = curSolved, LastWtdValue = prevSolved, DeltaPct = Delta(curSolved, prevSolved),
                    PctOfTotal = curTotal > 0 ? Math.Round(curSolved * 100.0 / curTotal, 1) : 0
                },
                OpenWithinSla = new ComplaintKpiCard
                {
                    Value = curOpenOk, LastWtdValue = prevOpenOk, DeltaPct = Delta(curOpenOk, prevOpenOk),
                    PctOfTotal = curTotal > 0 ? Math.Round(curOpenOk * 100.0 / curTotal, 1) : 0
                },
                OpenBreachedSla = new ComplaintKpiCard
                {
                    Value = curBreached, LastWtdValue = prevBreached, DeltaPct = Delta(curBreached, prevBreached),
                    PctOfTotal = curTotal > 0 ? Math.Round(curBreached * 100.0 / curTotal, 1) : 0
                },
                ComplaintRate = new ComplaintKpiCard { RateValue = curRate, LastWtdRateValue = prevRate, DeltaPts = Math.Round(curRate - prevRate, 2) },
                SlaPerformancePct = curSlaPerf,
                LastWtdSlaPerformancePct = prevSlaPerf
            };

            return Ok(summary);
        }

        // ------------------------------------------------------------
        // GET api/customercomplaint/trend?orgId=103
        // ------------------------------------------------------------
        [HttpGet("trend")]
        public IActionResult GetTrend(
            [FromQuery] int orgId = 103,
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null)
        {
            if (!IsAuthenticated) return Unauthorized(new { Message = "Session expired. Please log in again." });
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
                return BadRequest("From and To dates are required.");

            var ps = new[]
            {
                new OracleParam("orgId", orgId),
                new OracleParam("fromDate", DateTime.Parse(fromDate)),
                new OracleParam("toDate", DateTime.Parse(toDate))
            };

            var sql = @"
                SELECT
                    DATE(CCRDT)                                                                               AS DAY,
                    SUM(CASE WHEN CLOSE_DT IS NOT NULL AND DATE(CLOSE_DT) <= TARGET_COMP_DT THEN 1 ELSE 0 END)        AS SOLVED_WITHIN_SLA,
                    SUM(CASE WHEN CLOSE_DT IS NULL AND (TARGET_COMP_DT IS NULL OR TARGET_COMP_DT >= CURDATE()) THEN 1 ELSE 0 END) AS OPEN_WITHIN_SLA,
                    SUM(CASE WHEN CLOSE_DT IS NULL AND TARGET_COMP_DT < CURDATE() THEN 1 ELSE 0 END)       AS OPEN_BREACHED_SLA,
                    COUNT(*)                                                                                    AS TOTAL_COMPLAINTS
                FROM JAN_SERVICE_CCR_zoho
                WHERE ORG_ID = @orgId
                  AND CCRDT >=  DATE(@fromDate)
                  AND CCRDT <= DATE(@toDate)
                GROUP BY DATE(CCRDT)
                ORDER BY DATE(CCRDT)";

            DataTable dt = _db.ExecuteQuery(sql, ps);

            var ordersSql = @"
                SELECT COALESCE(SUM(QTY), 0) AS ORDERS_DELIVERED
                FROM
                (
                    SELECT DISTINCT ITEM_NO,
                           WEEK_SALE_QTY AS QTY
                    FROM JAN_SERVICE_CCR_zoho
                    WHERE ORG_ID = @orgId
                      AND DATE(CCRDT) >= DATE(@fromDate)
                      AND DATE(CCRDT) <= DATE(@toDate)
                ) t";
            int weekOrders = DbHelper.Val<int>(_db.ExecuteQuery(ordersSql, ps).Rows[0], "ORDERS_DELIVERED");

            var points = new List<ComplaintTrendPoint>();
            foreach (DataRow r in dt.Rows)
            {
                var day = DbHelper.Val<DateTime>(r, "DAY");
                int total = DbHelper.Val<int>(r, "TOTAL_COMPLAINTS");
                points.Add(new ComplaintTrendPoint
                {
                    Day = day,
                    DayLabel = day.ToString("MMM dd") + " " + day.ToString("ddd"),
                    SolvedWithinSla = DbHelper.Val<int>(r, "SOLVED_WITHIN_SLA"),
                    OpenWithinSla = DbHelper.Val<int>(r, "OPEN_WITHIN_SLA"),
                    OpenBreachedSla = DbHelper.Val<int>(r, "OPEN_BREACHED_SLA"),
                    ComplaintRatePct = weekOrders > 0 ? Math.Round(total * 100.0 / weekOrders, 2) : 0
                });
            }

            return Ok(points);
        }

        // ------------------------------------------------------------
        // GET api/customercomplaint/product-summary?orgId=103&page=1&pageSize=10
        // ------------------------------------------------------------
        [HttpGet("product-summary")]
        public IActionResult GetProductSummary(
            [FromQuery] int orgId = 103,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null)
        {
            if (!IsAuthenticated) return Unauthorized(new { Message = "Session expired. Please log in again." });
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
                return BadRequest("From and To dates are required.");

            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var baseSql = @"
                WITH item_orders AS (
                    SELECT ITEM_NO, MAX(WEEK_SALE_QTY) AS ORDERS_DELIVERED
                    FROM JAN_SERVICE_CCR_zoho
                    WHERE ORG_ID = @orgId AND DATE(CCRDT) >= DATE(@fromDate) AND DATE(CCRDT) <= DATE(@toDate)
                    GROUP BY ITEM_NO
                ),
                per_item AS (
                    SELECT
                        c.ITEM_NO,
                        MAX(c.COMP_CUS_NAME)                                                                      AS COMP_CUS_NAME,
                        MAX(c.DESCRIPTION)                                                                       AS PRODUCT_DESCRIPTION,
                        MAX(c.CUSREGION)                                                                          AS CUSREGION,
                        COUNT(*)                                                                                  AS TOTAL_COMPLAINTS,
                        SUM(CASE WHEN c.CLOSE_DT IS NOT NULL AND c.CLOSE_DT <= c.TARGET_COMP_DT THEN 1 ELSE 0 END) AS SOLVED_WITHIN_SLA,
                        SUM(CASE WHEN c.CLOSE_DT IS NULL AND (c.TARGET_COMP_DT IS NULL OR c.TARGET_COMP_DT >= CURDATE()) THEN 1 ELSE 0 END) AS OPEN_WITHIN_SLA,
                        SUM(CASE WHEN c.CLOSE_DT IS NULL AND c.TARGET_COMP_DT < CURDATE() THEN 1 ELSE 0 END)  AS OPEN_BREACHED_SLA
                    FROM JAN_SERVICE_CCR_zoho c
                    WHERE c.ORG_ID = @orgId AND DATE(c.CCRDT) >= DATE(@fromDate) AND DATE(c.CCRDT) <= DATE(@toDate)
                    GROUP BY c.ITEM_NO
                )
                SELECT p.ITEM_NO, p.COMP_CUS_NAME, p.CUSREGION, p.PRODUCT_DESCRIPTION, COALESCE(io.ORDERS_DELIVERED, 0) AS ORDERS_DELIVERED,
                       p.TOTAL_COMPLAINTS, p.SOLVED_WITHIN_SLA, p.OPEN_WITHIN_SLA, p.OPEN_BREACHED_SLA
                FROM per_item p
                LEFT JOIN item_orders io ON io.ITEM_NO = p.ITEM_NO";

            var ps = new[]
            {
                new OracleParam("orgId", orgId),
                new OracleParam("fromDate", DateTime.Parse(fromDate)),
                new OracleParam("toDate", DateTime.Parse(toDate))
            };

            int totalCount = Convert.ToInt32(_db.ExecuteQuery($"SELECT COUNT(*) AS CNT FROM ({baseSql}) t", ps).Rows[0]["CNT"]);

            int startRow = (page - 1) * pageSize;
            var pagedSql = $@"
                SELECT t.* FROM ({baseSql}) t
                ORDER BY t.TOTAL_COMPLAINTS DESC
                LIMIT @pageSize OFFSET @offset";

            var pagedPs = new[]
            {
                new OracleParam("orgId", orgId),
                new OracleParam("fromDate", DateTime.Parse(fromDate)),
                new OracleParam("toDate", DateTime.Parse(toDate)),
                new OracleParam("pageSize", pageSize),
                new OracleParam("offset", startRow)
            };

            DataTable dt = _db.ExecuteQuery(pagedSql, pagedPs);

            var rows = new List<ProductComplaintRow>();
            foreach (DataRow r in dt.Rows)
            {
                int complaintTotal = DbHelper.Val<int>(r, "TOTAL_COMPLAINTS");
                int solved = DbHelper.Val<int>(r, "SOLVED_WITHIN_SLA");
                int openOk = DbHelper.Val<int>(r, "OPEN_WITHIN_SLA");
                int breached = DbHelper.Val<int>(r, "OPEN_BREACHED_SLA");
                int orders = DbHelper.Val<int>(r, "ORDERS_DELIVERED");
                rows.Add(new ProductComplaintRow
                {
                    ProductCode = DbHelper.Val<string>(r, "ITEM_NO"),
                    CustomerName = DbHelper.Val<string>(r, "COMP_CUS_NAME"),
                    Region = DbHelper.Val<string>(r, "CUSREGION"),
                    ProductDescription = DbHelper.Val<string>(r, "PRODUCT_DESCRIPTION"),
                    OrdersDelivered = orders,
                    TotalComplaints = complaintTotal,
                    SolvedWithinSla = solved,
                    SolvedWithinSlaPct = complaintTotal > 0 ? Math.Round(solved * 100.0 / complaintTotal, 1) : 0,
                    OpenWithinSla = openOk,
                    OpenWithinSlaPct = complaintTotal > 0 ? Math.Round(openOk * 100.0 / complaintTotal, 1) : 0,
                    OpenBreachedSla = breached,
                    OpenBreachedSlaPct = complaintTotal > 0 ? Math.Round(breached * 100.0 / complaintTotal, 1) : 0,
                    ComplaintRatePct = orders > 0 ? Math.Round(complaintTotal * 100.0 / orders, 2) : 0
                });
            }

            var totalsSql = @"
                SELECT COALESCE(SUM(io.ORDERS_DELIVERED), 0) AS ORDERS_DELIVERED,
                       COALESCE(SUM(p.TOTAL_COMPLAINTS), 0)   AS TOTAL_COMPLAINTS,
                       COALESCE(SUM(p.SOLVED_WITHIN_SLA), 0)  AS SOLVED_WITHIN_SLA,
                       COALESCE(SUM(p.OPEN_WITHIN_SLA), 0)    AS OPEN_WITHIN_SLA,
                       COALESCE(SUM(p.OPEN_BREACHED_SLA), 0)  AS OPEN_BREACHED_SLA
                FROM (
                    SELECT c.ITEM_NO, COUNT(*) AS TOTAL_COMPLAINTS,
                           SUM(CASE WHEN c.CLOSE_DT IS NOT NULL AND c.CLOSE_DT <= c.TARGET_COMP_DT THEN 1 ELSE 0 END) AS SOLVED_WITHIN_SLA,
                           SUM(CASE WHEN c.CLOSE_DT IS NULL AND (c.TARGET_COMP_DT IS NULL OR c.TARGET_COMP_DT >= CURDATE()) THEN 1 ELSE 0 END) AS OPEN_WITHIN_SLA,
                           SUM(CASE WHEN c.CLOSE_DT IS NULL AND c.TARGET_COMP_DT < CURDATE() THEN 1 ELSE 0 END) AS OPEN_BREACHED_SLA
                    FROM JAN_SERVICE_CCR_zoho c
                    WHERE c.ORG_ID = @orgId AND DATE(c.CCRDT) >= DATE(@fromDate)
                    AND DATE(c.CCRDT) <= DATE(@toDate)
                    GROUP BY c.ITEM_NO
                ) p
                LEFT JOIN (
                    SELECT ITEM_NO, MAX(WEEK_SALE_QTY) AS ORDERS_DELIVERED
                    FROM JAN_SERVICE_CCR_zoho
                    WHERE ORG_ID = @orgId AND DATE(CCRDT) >= DATE(@fromDate)
                    AND DATE(CCRDT) <= DATE(@toDate)
                    GROUP BY ITEM_NO
                ) io ON io.ITEM_NO = p.ITEM_NO";

            var tRow = _db.ExecuteQuery(totalsSql, ps).Rows[0];
            int tTotal = DbHelper.Val<int>(tRow, "TOTAL_COMPLAINTS");
            int tSolved = DbHelper.Val<int>(tRow, "SOLVED_WITHIN_SLA");
            int tOpenOk = DbHelper.Val<int>(tRow, "OPEN_WITHIN_SLA");
            int tBreached = DbHelper.Val<int>(tRow, "OPEN_BREACHED_SLA");
            int tOrders = DbHelper.Val<int>(tRow, "ORDERS_DELIVERED");

            var total = new ProductComplaintRow
            {
                ProductCode = "Total",
                OrdersDelivered = tOrders,
                TotalComplaints = tTotal,
                SolvedWithinSla = tSolved,
                SolvedWithinSlaPct = tTotal > 0 ? Math.Round(tSolved * 100.0 / tTotal, 1) : 0,
                OpenWithinSla = tOpenOk,
                OpenWithinSlaPct = tTotal > 0 ? Math.Round(tOpenOk * 100.0 / tTotal, 1) : 0,
                OpenBreachedSla = tBreached,
                OpenBreachedSlaPct = tTotal > 0 ? Math.Round(tBreached * 100.0 / tTotal, 1) : 0,
                ComplaintRatePct = tOrders > 0 ? Math.Round(tTotal * 100.0 / tOrders, 2) : 0
            };

            var result = new ProductComplaintTableResult
            {
                Rows = rows,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(result);
        }

        // ------------------------------------------------------------
        // GET api/customercomplaint/export?orgId=103
        // CSV for the "Download" button (all products, unpaginated)
        // ------------------------------------------------------------
        [HttpGet("export")]
        public IActionResult Export(
            [FromQuery] int orgId = 103,
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null)
        {
            if (!IsAuthenticated) return Unauthorized(new { Message = "Session expired. Please log in again." });

            var okResult = GetProductSummary(
                orgId,
                1,
                int.MaxValue,
                fromDate,
                toDate
            ) as OkObjectResult;
            var response = okResult?.Value as ProductComplaintTableResult;
            var rows = response?.Rows ?? new List<ProductComplaintRow>();

            var sb = new System.Text.StringBuilder();
            sb.AppendLine("Product Code,Product Description,Orders Delivered (WTD),Total Complaints (WTD)," +
                           "Solved Within SLA #,Solved Within SLA %,Open Within SLA #,Open Within SLA %," +
                           "Open/Breached SLA #,Open/Breached SLA %,Complaint Rate (%)");
            foreach (var r in rows)
            {
                sb.AppendLine($"{r.ProductCode},{r.ProductDescription},{r.OrdersDelivered},{r.TotalComplaints}," +
                               $"{r.SolvedWithinSla},{r.SolvedWithinSlaPct},{r.OpenWithinSla},{r.OpenWithinSlaPct}," +
                               $"{r.OpenBreachedSla},{r.OpenBreachedSlaPct},{r.ComplaintRatePct}");
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
            return File(bytes, "text/csv", $"customer-complaints-wtd-{DateTime.Now:yyyyMMdd}.csv");
        }
    }
}
