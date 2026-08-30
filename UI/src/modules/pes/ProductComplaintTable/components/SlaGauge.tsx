import React from "react";
import { Info } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

interface SlaGaugeProps {
  valuePct?: number;
  targetPct?: number;
  deltaPct?: number;
  loading: boolean;
}

export default function SlaGauge({ valuePct = 0, targetPct = 90, deltaPct = 0, loading }: SlaGaugeProps) {
  const cx = 110;
  const cy = 100;
  const r = 80;

  // zones as fractions of 0-180deg arc, breakpoints derived from target
  const redEnd = Math.max(targetPct - 30, 20);
  const amberEnd = targetPct;

  const needleAngle = (Math.min(Math.max(valuePct, 0), 100) / 100) * 180;
  const needleTip = polarToCartesian(cx, cy, r - 14, needleAngle);
  const targetAngle = (targetPct / 100) * 180;
  const targetOuter = polarToCartesian(cx, cy, r + 6, targetAngle);
  const targetInner = polarToCartesian(cx, cy, r - 10, targetAngle);

  const zoneColor = valuePct >= targetPct ? "text-emerald-600" : valuePct >= redEnd ? "text-amber-600" : "text-red-600";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        SLA Performance (WTD)
        <Info size={12} className="text-slate-300" />
      </div>

      {loading ? (
        <div className="h-[220px] animate-pulse rounded bg-slate-100" />
      ) : (
        <div className="flex flex-col items-center">
          <svg width="220" height="130" viewBox="0 0 220 130">
            <path d={arcPath(cx, cy, r, 0, redEnd * 1.8)} stroke="#ef4444" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d={arcPath(cx, cy, r, redEnd * 1.8, amberEnd * 1.8)} stroke="#f59e0b" strokeWidth="14" fill="none" />
            <path d={arcPath(cx, cy, r, amberEnd * 1.8, 180)} stroke="#22c55e" strokeWidth="14" fill="none" strokeLinecap="round" />

            {/* target marker */}
            <line x1={targetInner.x} y1={targetInner.y} x2={targetOuter.x} y2={targetOuter.y} stroke="#334155" strokeWidth="2" />

            {/* needle */}
            <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="#334155" />
          </svg>

          <div className={`-mt-4 text-2xl font-bold ${zoneColor}`}>{valuePct}%</div>
          <div className="text-[11px] text-slate-400">Within SLA</div>
          <div className="mt-1 text-[11px] text-slate-400">
            vs Last WTD:{" "}
            <span className={deltaPct >= 0 ? "text-emerald-600" : "text-red-600"}>
              {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct)}%
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">SLA Target ≥ 100%</div>
        </div>
      )}
    </div>
  );
}
