import { queryApi } from "../../../../api/endpoints";

export interface ComplaintKpiCard {
  value?: number;
  lastWtdValue?: number;
  deltaPct?: number;
  pctOfTotal?: number;
  rateValue?: number;
  lastWtdRateValue?: number;
  deltaPts?: number;
}

export interface ComplaintDashboardSummary {
  asOf: string;
  totalComplaints: ComplaintKpiCard;
  solvedWithinSla: ComplaintKpiCard;
  openWithinSla: ComplaintKpiCard;
  openBreachedSla: ComplaintKpiCard;
  complaintRate: ComplaintKpiCard;
  slaPerformancePct: number;
  lastWtdSlaPerformancePct: number;
}

export interface ComplaintTrendPoint {
  day: string;
  dayLabel: string;
  solvedWithinSla: number;
  openWithinSla: number;
  openBreachedSla: number;
  complaintRatePct: number;
}

export interface ProductComplaintRow {
  productCode: string;
  customerName?: string;
  region?: string;
  productDescription?: string;
  ordersDelivered: number;
  totalComplaints: number;
  solvedWithinSla: number;
  solvedWithinSlaPct: number;
  openWithinSla: number;
  openWithinSlaPct: number;
  openBreachedSla: number;
  openBreachedSlaPct: number;
  complaintRatePct: number;
}

export interface ProductComplaintTableResult {
  rows: ProductComplaintRow[];
  total: ProductComplaintRow;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const getComplaintSummary = async (
  orgId: number,
  fromDate: string,
  toDate: string
): Promise<ComplaintDashboardSummary> => {
  const res = await queryApi.execute({
    QueryNumber: 123,
    InputParameters: { orgId, fromDate, toDate }
  });

  const data = res?.data || [];
  const cur = data.find((r: any) => r.PERIOD === "CUR") || {};
  const prev = data.find((r: any) => r.PERIOD === "PREV") || {};

  const curTotal = Number(cur.TOTAL_COMPLAINTS || 0);
  const curSolved = Number(cur.SOLVED_WITHIN_SLA || 0);
  const curOpenOk = Number(cur.OPEN_WITHIN_SLA || 0);
  const curBreached = Number(cur.OPEN_BREACHED_SLA || 0);
  const curOrders = Number(cur.ORDERS_DELIVERED || 0);

  const prevTotal = Number(prev.TOTAL_COMPLAINTS || 0);
  const prevSolved = Number(prev.SOLVED_WITHIN_SLA || 0);
  const prevOpenOk = Number(prev.OPEN_WITHIN_SLA || 0);
  const prevBreached = Number(prev.OPEN_BREACHED_SLA || 0);
  const prevOrders = Number(prev.ORDERS_DELIVERED || 0);

  const curRate = curOrders > 0 ? Math.round((curTotal * 100.0 / curOrders) * 100) / 100 : 0;
  const prevRate = prevOrders > 0 ? Math.round((prevTotal * 100.0 / prevOrders) * 100) / 100 : 0;

  const curSlaPerf = curTotal > 0 ? Math.round((curSolved * 100.0 / curTotal) * 10) / 10 : 0;
  const prevSlaPerf = prevTotal > 0 ? Math.round((prevSolved * 100.0 / prevTotal) * 10) / 10 : 0;

  const delta = (c: number, p: number) => p === 0 ? 0 : Math.round(((c - p) * 10.0 / p) * 10) / 10;

  return {
    asOf: new Date().toISOString(),
    totalComplaints: { value: curTotal, lastWtdValue: prevTotal, deltaPct: delta(curTotal, prevTotal) },
    solvedWithinSla: {
      value: curSolved, lastWtdValue: prevSolved, deltaPct: delta(curSolved, prevSolved),
      pctOfTotal: curTotal > 0 ? Math.round((curSolved * 100.0 / curTotal) * 10) / 10 : 0
    },
    openWithinSla: {
      value: curOpenOk, lastWtdValue: prevOpenOk, deltaPct: delta(curOpenOk, prevOpenOk),
      pctOfTotal: curTotal > 0 ? Math.round((curOpenOk * 100.0 / curTotal) * 10) / 10 : 0
    },
    openBreachedSla: {
      value: curBreached, lastWtdValue: prevBreached, deltaPct: delta(curBreached, prevBreached),
      pctOfTotal: curTotal > 0 ? Math.round((curBreached * 100.0 / curTotal) * 10) / 10 : 0
    },
    complaintRate: { rateValue: curRate, lastWtdRateValue: prevRate, deltaPts: Math.round((curRate - prevRate) * 100) / 100 },
    slaPerformancePct: curSlaPerf,
    lastWtdSlaPerformancePct: prevSlaPerf
  };
};

export const getComplaintTrend = async (
  orgId: number,
  fromDate: string,
  toDate: string
): Promise<ComplaintTrendPoint[]> => {
  const res = await queryApi.execute({
    QueryNumber: 124,
    InputParameters: { orgId, fromDate, toDate }
  });

  const data = res?.data || [];
  return data.map((r: any) => {
    const day = new Date(r.DAY);
    const dayLabel = day.toLocaleString("en-US", { month: "short", day: "2-digit" }) + " " + day.toLocaleString("en-US", { weekday: "short" });
    return {
      day: r.DAY,
      dayLabel,
      solvedWithinSla: Number(r.SOLVED_WITHIN_SLA || 0),
      openWithinSla: Number(r.OPEN_WITHIN_SLA || 0),
      openBreachedSla: Number(r.OPEN_BREACHED_SLA || 0),
      complaintRatePct: Number(r.COMPLAINT_RATE_PCT || 0)
    };
  });
};

export const getProductSummary = async (
  orgId: number,
  page: number,
  pageSize: number,
  fromDate: string,
  toDate: string
): Promise<ProductComplaintTableResult> => {
  const rowsRes = await queryApi.execute({
    QueryNumber: 125,
    InputParameters: { orgId, fromDate, toDate, limit: pageSize, offset: (page - 1) * pageSize }
  });

  const totalsRes = await queryApi.execute({
    QueryNumber: 126,
    InputParameters: { orgId, fromDate, toDate }
  });

  const rowsData = rowsRes?.data || [];
  const totalCount = rowsData.length > 0 ? Number(rowsData[0].TOTAL_ROWS || 0) : 0;

  const rows = rowsData.map((r: any) => {
    const total = Number(r.TOTAL_COMPLAINTS || 0);
    const solved = Number(r.SOLVED_WITHIN_SLA || 0);
    const openOk = Number(r.OPEN_WITHIN_SLA || 0);
    const breached = Number(r.OPEN_BREACHED_SLA || 0);
    const orders = Number(r.ORDERS_DELIVERED || 0);

    return {
      productCode: r.ITEM_NO,
      customerName: r.COMP_CUS_NAME,
      region: r.CUSREGION,
      productDescription: r.PRODUCT_DESCRIPTION,
      ordersDelivered: orders,
      totalComplaints: total,
      solvedWithinSla: solved,
      solvedWithinSlaPct: total > 0 ? Math.round((solved * 100.0 / total) * 10) / 10 : 0,
      openWithinSla: openOk,
      openWithinSlaPct: total > 0 ? Math.round((openOk * 100.0 / total) * 10) / 10 : 0,
      openBreachedSla: breached,
      openBreachedSlaPct: total > 0 ? Math.round((breached * 100.0 / total) * 10) / 10 : 0,
      complaintRatePct: orders > 0 ? Math.round((total * 100.0 / orders) * 100) / 100 : 0
    };
  });

  const tRow = totalsRes?.data?.[0] || {};
  const tTotal = Number(tRow.TOTAL_COMPLAINTS || 0);
  const tSolved = Number(tRow.SOLVED_WITHIN_SLA || 0);
  const tOpenOk = Number(tRow.OPEN_WITHIN_SLA || 0);
  const tBreached = Number(tRow.OPEN_BREACHED_SLA || 0);
  const tOrders = Number(tRow.ORDERS_DELIVERED || 0);

  const total = {
    productCode: "Total",
    ordersDelivered: tOrders,
    totalComplaints: tTotal,
    solvedWithinSla: tSolved,
    solvedWithinSlaPct: tTotal > 0 ? Math.round((tSolved * 100.0 / tTotal) * 10) / 10 : 0,
    openWithinSla: tOpenOk,
    openWithinSlaPct: tTotal > 0 ? Math.round((tOpenOk * 100.0 / tTotal) * 10) / 10 : 0,
    openBreachedSla: tBreached,
    openBreachedSlaPct: tTotal > 0 ? Math.round((tBreached * 100.0 / tTotal) * 10) / 10 : 0,
    complaintRatePct: tOrders > 0 ? Math.round((tTotal * 100.0 / tOrders) * 100) / 100 : 0
  };

  return {
    rows,
    total,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize)
  };
};

export const downloadComplaintExport = async (
  orgId: number,
  fromDate: string,
  toDate: string
): Promise<void> => {
  try {
    const response = await queryApi.execute({
      QueryNumber: 125,
      InputParameters: { orgId, fromDate, toDate, limit: 100000, offset: 0 }
    });
    const rows = response?.data || [];

    const headers = [
      "Product Code",
      "Product Description",
      "Orders Delivered (WTD)",
      "Total Complaints (WTD)",
      "Solved Within SLA #",
      "Solved Within SLA %",
      "Open Within SLA #",
      "Open Within SLA %",
      "Open/Breached SLA #",
      "Open/Breached SLA %",
      "Complaint Rate (%)"
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) => {
        const total = Number(r.TOTAL_COMPLAINTS || 0);
        const solved = Number(r.SOLVED_WITHIN_SLA || 0);
        const openOk = Number(r.OPEN_WITHIN_SLA || 0);
        const breached = Number(r.OPEN_BREACHED_SLA || 0);
        const orders = Number(r.ORDERS_DELIVERED || 0);

        const solvedPct = total > 0 ? (solved * 100.0 / total).toFixed(1) : "0";
        const openOkPct = total > 0 ? (openOk * 100.0 / total).toFixed(1) : "0";
        const breachedPct = total > 0 ? (breached * 100.0 / total).toFixed(1) : "0";
        const ratePct = orders > 0 ? (total * 100.0 / orders).toFixed(2) : "0";

        return [
          r.ITEM_NO || "",
          `"${(r.PRODUCT_DESCRIPTION || "").replace(/"/g, '""')}"`,
          orders,
          total,
          solved,
          solvedPct,
          openOk,
          openOkPct,
          breached,
          breachedPct,
          ratePct
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customer-complaints-wtd-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to export complaints:", error);
    alert("Failed to export complaints");
  }
};
