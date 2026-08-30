  import React, { useEffect, useState, useCallback } from "react";
  import { Info, Filter, Download } from "lucide-react";
  import ComplaintKpiCards from "../components/ComplaintKpiCards";
  import ComplaintsTrendChart from "../components/ComplaintsTrendChart";
  import SlaGauge from "../components/SlaGauge";
  import ProductComplaintTable from "../components/ProductComplaintTable";
  import {
    getComplaintSummary,
    getComplaintTrend,
    getProductSummary,
    downloadComplaintExport,
  } from "../services/complaintApi";

  const ORG_ID = 103;

const getWeekRange = () => {
  const today = new Date();

  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(sunday),
    to: formatDate(saturday),
  };
};

const defaultRange = getWeekRange();


  export default function CustomerComplaintOverview() {
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const [trend, setTrend] = useState([]);
    const [trendLoading, setTrendLoading] = useState(true);

    const [productResult, setProductResult] = useState(null);
    const [productLoading, setProductLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

//     const [fromDate, setFromDate] = useState("2026-04-01");
// const [toDate, setToDate] = useState("2026-05-22");
const defaultRange = getWeekRange();
 const [fromDate, setFromDate] = useState(defaultRange.from);
const [toDate, setToDate] = useState(defaultRange.to);

  

    const [error, setError] = useState(null);

    useEffect(() => {
  setSummaryLoading(true);

  getComplaintSummary(ORG_ID, fromDate, toDate)
    .then(setSummary)
    .catch(() =>
      setError("Could not load the summary cards. Please try again.")
    )
    .finally(() => setSummaryLoading(false));
}, [fromDate, toDate]);

    useEffect(() => {
  setTrendLoading(true);

  getComplaintTrend(ORG_ID, fromDate, toDate)
    .then(setTrend)
    .catch(() =>
      setError("Could not load the trend chart. Please try again.")
    )
    .finally(() => setTrendLoading(false));
}, [fromDate, toDate]);

    const loadProducts = useCallback(() => {
  setProductLoading(true);

  getProductSummary(
    ORG_ID,
    page,
    pageSize,
    fromDate,
    toDate
  )
    .then(setProductResult)
    .catch(() =>
      setError("Could not load the product summary. Please try again.")
    )
    .finally(() => setProductLoading(false));
}, [page, pageSize, fromDate, toDate]);

    useEffect(() => {
      loadProducts();
    }, [loadProducts]);

    const asOfLabel = summary?.asOf
      ? new Date(summary.asOf).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1 text-base font-semibold text-slate-800">
                Customer Complaints Overview (WTD)
                <Info size={14} className="text-slate-300" />
              </div>
              <p className="text-xs text-slate-400">
                Product-wise view of customer complaints from Customer Complaint Portal (Source System)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Data as on: {asOfLabel}</span>
              {/* <button className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Filter size={13} /> Filter
              </button> */}
            <div className="flex items-center gap-2">
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
  />

  <input
    type="date"
    value={toDate}
    min={fromDate}
    onChange={(e) => setToDate(e.target.value)}
    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
  />
</div>
              <button
                onClick={() =>
  downloadComplaintExport(
    ORG_ID,
    fromDate,
    toDate
  )
}
                className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* KPI cards */}
          <ComplaintKpiCards summary={summary} loading={summaryLoading} />

          {/* Trend + Gauge */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <ComplaintsTrendChart data={trend} loading={trendLoading} />
            <SlaGauge
              valuePct={summary?.slaPerformancePct ?? 0}
              targetPct={summary?.slaTargetPct ?? 90}
              deltaPct={
                summary
                  ? Math.round((summary.slaPerformancePct - summary.lastWtdSlaPerformancePct) * 10) / 10
                  : 0
              }
              loading={summaryLoading}
            />
          </div>

          {/* Product-wise table */}
          <ProductComplaintTable
            result={productResult}
            loading={productLoading}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
        </div>
      </div>
      
    );
  }
