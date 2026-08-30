namespace CustomerComplaintApi.Models
{
    public class ComplaintKpiCard
    {
        public int Value { get; set; }
        public double? RateValue { get; set; }
        public double PctOfTotal { get; set; }
        public int LastWtdValue { get; set; }
        public double? LastWtdRateValue { get; set; }
        public double DeltaPct { get; set; }
        public double DeltaPts { get; set; }
    }

    public class ComplaintDashboardSummary
    {
        public DateTime AsOf { get; set; }
        public ComplaintKpiCard TotalComplaints { get; set; }
        public ComplaintKpiCard SolvedWithinSla { get; set; }
        public ComplaintKpiCard OpenWithinSla { get; set; }
        public ComplaintKpiCard OpenBreachedSla { get; set; }
        public ComplaintKpiCard ComplaintRate { get; set; }
        public double SlaPerformancePct { get; set; }
        public double SlaTargetPct { get; set; } = 90.0;
        public double LastWtdSlaPerformancePct { get; set; }
    }

    public class ComplaintTrendPoint
    {
        public DateTime Day { get; set; }
        public string DayLabel { get; set; }
        public int SolvedWithinSla { get; set; }
        public int OpenWithinSla { get; set; }
        public int OpenBreachedSla { get; set; }
        public double ComplaintRatePct { get; set; }
    }

    public class ProductComplaintRow
    {
        public string ProductCode { get; set; }
        public string CustomerName { get; set; }
        public string Region {  get; set; }
        public string ProductDescription { get; set; }
        public int OrdersDelivered { get; set; }
        public int TotalComplaints { get; set; }
        public int SolvedWithinSla { get; set; }
        public double SolvedWithinSlaPct { get; set; }
        public int OpenWithinSla { get; set; }
        public double OpenWithinSlaPct { get; set; }
        public int OpenBreachedSla { get; set; }
        public double OpenBreachedSlaPct { get; set; }
        public double ComplaintRatePct { get; set; }
    }

    public class ProductComplaintTableResult
    {
        public List<ProductComplaintRow> Rows { get; set; } = new();
        public ProductComplaintRow Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
}
