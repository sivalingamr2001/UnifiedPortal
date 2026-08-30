import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";

export default function ComplaintsTrendChart({ data, loading }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Complaints Trend (WTD)
        <Info size={12} className="text-slate-300" />
      </div>

      {loading ? (
        <div className="h-[260px] animate-pulse rounded bg-slate-100" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="count"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "No. of Complaints", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              label={{ value: "Complaint Rate (%)", angle: 90, position: "insideRight", fontSize: 10, fill: "#94a3b8" }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(value, name) =>
                name === "Complaint Rate (%)" ? [`${value}%`, name] : [value, name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="count" dataKey="solvedWithinSla" stackId="a" name="Solved Within SLA" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="count" dataKey="openWithinSla" stackId="a" name="Open Within SLA" fill="#f59e0b" />
            <Bar yAxisId="count" dataKey="openBreachedSla" stackId="a" name="Open / Breached SLA" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="complaintRatePct"
              name="Complaint Rate (%)"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3, fill: "#7c3aed" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
