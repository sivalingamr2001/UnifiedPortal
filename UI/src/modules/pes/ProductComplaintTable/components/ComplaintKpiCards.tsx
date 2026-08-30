import React from "react";
import { Info, ArrowUp, ArrowDown } from "lucide-react";
import type { ComplaintDashboardSummary } from "../services/complaintApi";

interface DeltaProps {
  value?: number | null;
  suffix?: string;
  invertColor?: boolean;
}

function Delta({ value, suffix = "%", invertColor = false }: DeltaProps) {
  if (value === 0 || value === undefined || value === null) {
    return <span className="text-slate-400">—</span>;
  }
  const isUp = value > 0;
  // For most cards, up = good (green). For "Open/Breached SLA", up = bad (red).
  const good = invertColor ? !isUp : isUp;
  const color = good ? "text-emerald-600" : "text-red-600";
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${color}`}>
      <Icon size={11} strokeWidth={3} />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

interface CardProps {
  title: string;
  value: React.ReactNode;
  valueColor?: string;
  footnote?: React.ReactNode;
  delta: React.ReactNode;
  deltaLabel?: string;
}

function Card({ title, value, valueColor, footnote, delta, deltaLabel = "vs Last WTD" }: CardProps) {
  return (
    <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm min-w-[180px]">
      <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {title}
        <Info size={12} className="text-slate-300" />
      </div>
      <div className={`mt-1 text-2xl font-semibold ${valueColor || "text-slate-800"}`}>{value}</div>
      {footnote && <div className="mt-0.5 text-[11px] text-slate-400">{footnote}</div>}
      <div className="mt-1.5 text-[11px] text-slate-400">
        {deltaLabel}: {delta}
      </div>
    </div>
  );
}

interface ComplaintKpiCardsProps {
  summary?: ComplaintDashboardSummary | null;
  loading: boolean;
}

export default function ComplaintKpiCards({ summary, loading }: ComplaintKpiCardsProps) {
  if (loading || !summary) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[92px] flex-1 min-w-[180px] animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  const { totalComplaints, solvedWithinSla, openWithinSla, openBreachedSla, complaintRate } = summary;

  return (
    <div className="flex flex-wrap gap-4">
      <Card
        title="Total Complaints (WTD)"
        value={totalComplaints.value}
        footnote={`vs Last WTD: ${totalComplaints.lastWtdValue}`}
        delta={<Delta value={totalComplaints.deltaPct} />}
      />
      <Card
        title="Solved Within SLA"
        value={solvedWithinSla.value}
        valueColor="text-emerald-600"
        footnote={`${solvedWithinSla.pctOfTotal}% of Total`}
        delta={<Delta value={solvedWithinSla.deltaPct} />}
      />
      <Card
        title="Open Within SLA"
        value={openWithinSla.value}
        valueColor="text-amber-600"
        footnote={`${openWithinSla.pctOfTotal}% of Total`}
        delta={<Delta value={openWithinSla.deltaPct} />}
      />
      <Card
        title="Open / Breached SLA"
        value={openBreachedSla.value}
        valueColor="text-red-600"
        footnote={`${openBreachedSla.pctOfTotal}% of Total`}
        delta={<Delta value={openBreachedSla.deltaPct} invertColor />}
      />
      <Card
        title="Complaint Rate (WTD)"
        value={`${complaintRate.rateValue}%`}
        valueColor="text-violet-600"
        footnote="Complaints / Orders Delivered"
        delta={<Delta value={complaintRate.deltaPts} suffix="pp" invertColor />}
      />
    </div>
  );
}
