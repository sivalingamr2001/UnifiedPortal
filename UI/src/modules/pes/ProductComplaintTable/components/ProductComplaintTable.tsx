import React from "react";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductComplaintTableResult } from "../services/complaintApi";

interface PctProps {
  value: number;
  tone?: "emerald" | "amber" | "red" | "slate" | "violet";
}

function Pct({ value, tone = "slate" }: PctProps) {
  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    slate: "text-slate-500",
    violet: "text-violet-600",
  };
  return <span className={toneMap[tone]}>{value}%</span>;
}

interface ProductComplaintTableProps {
  result?: ProductComplaintTableResult | null;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function ProductComplaintTable({
  result,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProductComplaintTableProps) {
  const rows = result?.rows || [];
  const total = result?.total;
  const totalPages = result?.totalPages || 1;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Product-wise Complaint Summary (WTD)
        <Info size={12} className="text-slate-300" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="text-[11px] uppercase tracking-wide">
              <th rowSpan={2} className="px-3 py-2 text-left align-bottom">#</th>
              <th rowSpan={2} className="px-3 py-2 text-left align-bottom">Product Code</th>
              <th rowSpan={2} className="px-3 py-2 text-left align-bottom">customerName</th>
              <th rowSpan={2} className="px-3 py-2 text-left align-bottom">region</th>
              <th rowSpan={2} className="px-3 py-2 text-left align-bottom">Product Description</th>
              <th rowSpan={2} className="px-3 py-2 text-right align-bottom">Orders Delivered (WTD)</th>
              <th rowSpan={2} className="px-3 py-2 text-right align-bottom">Total Complaints (WTD)</th>
              <th colSpan={2} className="border-l border-slate-100 px-3 py-1 text-center">Solved Within SLA</th>
              <th colSpan={2} className="border-l border-slate-100 px-3 py-1 text-center">Open Within SLA</th>
              <th colSpan={2} className="border-l border-slate-100 px-3 py-1 text-center">Open / Breached SLA</th>
              <th rowSpan={2} className="px-3 py-2 text-right align-bottom">Complaint Rate (%)</th>
            </tr>
            <tr className="text-[11px] uppercase tracking-wide">
              <th className="border-l border-slate-100 px-3 py-1 text-right">#</th>
              <th className="px-3 py-1 text-right">%</th>
              <th className="border-l border-slate-100 px-3 py-1 text-right">#</th>
              <th className="px-3 py-1 text-right">%</th>
              <th className="border-l border-slate-100 px-3 py-1 text-right">#</th>
              <th className="px-3 py-1 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={14} className="px-3 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-sm text-slate-500">
                  No complaints in the selected WTD window.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r, i) => (
                <tr key={r.productCode} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-500">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-3 py-2 font-medium text-indigo-600">{r.productCode}</td>
                  <td className="px-3 py-2 text-slate-700">{r.customerName}</td>
                  <td className="px-3 py-2 text-slate-700">{r.region}</td>
                  <td className="px-3 py-2 text-slate-700">{r.productDescription}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{r.ordersDelivered.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">{r.totalComplaints}</td>
                  <td className="border-l border-slate-100 px-3 py-2 text-right text-emerald-700">{r.solvedWithinSla}</td>
                  <td className="px-3 py-2 text-right"><Pct value={r.solvedWithinSlaPct} tone="emerald" /></td>
                  <td className="border-l border-slate-100 px-3 py-2 text-right text-amber-700">{r.openWithinSla}</td>
                  <td className="px-3 py-2 text-right"><Pct value={r.openWithinSlaPct} tone="amber" /></td>
                  <td className="border-l border-slate-100 px-3 py-2 text-right text-red-700">{r.openBreachedSla}</td>
                  <td className="px-3 py-2 text-right"><Pct value={r.openBreachedSlaPct} tone="red" /></td>
                  <td className="px-3 py-2 text-right"><Pct value={r.complaintRatePct} tone="violet" /></td>
                </tr>
              ))}
          </tbody>
          {!loading && total && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-800">
                <td className="px-3 py-2" colSpan={5}>Total</td>
                <td className="px-3 py-2 text-right">{total.ordersDelivered.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{total.totalComplaints}</td>
                <td className="border-l border-slate-100 px-3 py-2 text-right text-emerald-700">{total.solvedWithinSla}</td>
                <td className="px-3 py-2 text-right"><Pct value={total.solvedWithinSlaPct} tone="emerald" /></td>
                <td className="border-l border-slate-100 px-3 py-2 text-right text-amber-700">{total.openWithinSla}</td>
                <td className="px-3 py-2 text-right"><Pct value={total.openWithinSlaPct} tone="amber" /></td>
                <td className="border-l border-slate-100 px-3 py-2 text-right text-red-700">{total.openBreachedSla}</td>
                <td className="px-3 py-2 text-right"><Pct value={total.openBreachedSlaPct} tone="red" /></td>
                <td className="px-3 py-2 text-right"><Pct value={total.complaintRatePct} tone="violet" /></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-slate-200 px-1.5 py-0.5 text-xs"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded border border-slate-200 p-1 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded border border-slate-200 p-1 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
        Complaint Rate (%) = (Total Complaints / Orders Delivered) × 100
      </div>
    </div>
  );
}
