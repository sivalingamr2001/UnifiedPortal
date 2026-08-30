// src/components/StatCards.tsx
import React from "react";
import type { DashboardConsolidatedMetrics } from "../api/commodityApi";
import { ChartNoAxesColumn } from "lucide-react";

interface StatCardsProps {
  data: DashboardConsolidatedMetrics | null;
  loading?: boolean;
}

interface CardConfig {
  key: string;
  label: string;
  gradient: string; // Tailored linear gradient for the top bar
  iconColor: string; // Tailored color for the icon
  textLabelColor: string; // Color for the tracking subtitle text
  total: keyof DashboardConsolidatedMetrics;
  shortage: keyof DashboardConsolidatedMetrics;
  overdue: keyof DashboardConsolidatedMetrics;
  okWhenZero?: boolean;
}

const CARDS: CardConfig[] = [
  {
    key: "t1a",
    label: "T1A TRACKING",
    gradient: "linear-gradient(90deg, rgb(220, 38, 38), rgb(239, 68, 68))", // Red gradient
    iconColor: "text-red-600",
    textLabelColor: "text-red-700",
    total: "TOTAL_TRACK_1A",
    shortage: "SHORTAGE_TRACK_1A",
    overdue: "OVERDUE_TRACK_1A"
  },
  {
    key: "t1b",
    label: "T1B TRACKING",
    gradient: "linear-gradient(90deg, rgb(217, 119, 6), rgb(245, 158, 11))", // Amber gradient
    iconColor: "text-amber-600",
    textLabelColor: "text-amber-700",
    total: "TOTAL_TRACK_1B",
    shortage: "SHORTAGE_TRACK_1B",
    overdue: "OVERDUE_TRACK_1B"
  },
  {
    key: "t2",
    label: "T2 TRACKING",
    gradient: "linear-gradient(90deg, rgb(71, 85, 105), rgb(148, 163, 184))", // Slate gradient
    iconColor: "text-slate-600",
    textLabelColor: "text-slate-700",
    total: "TOTAL_TRACK_2",
    shortage: "SHORTAGE_TRACK_2",
    overdue: "OVERDUE_TRACK_2",
    okWhenZero: true
  },
];

export const StatCards: React.FC<StatCardsProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="flex w-full items-stretch justify-between gap-4 font-sans animate-pulse">
        {CARDS.map((c) => (
          <div 
            key={c.key} 
            className="flex-1 flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50/50 shadow-sm h-[108px]" 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-stretch justify-between gap-4 font-sans select-none">
      {CARDS.map((c) => {
        const total = ((data[c.total] as number) ?? 0);
        const shortage = ((data[c.shortage] as number) ?? 0);
        const overdue = ((data[c.overdue] as number) ?? 0);

        // Conditional display configurations for dynamic statuses
        const isShortageOk = shortage === 0 && c.okWhenZero;
        const isOverdueOk = overdue === 0 && c.okWhenZero;

        return (
          <div key={c.key} className="flex-1 flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
            {/* Top Accent Gradient Bar */}
            <div className="h-[3px]" style={{ background: c.gradient }} />
            
            {/* Inner Content Container */}
            <div className="flex flex-col gap-2 px-3 py-2.5">
              {/* Header Label */}
              <div className="flex items-center gap-1.5">
                <ChartNoAxesColumn
                  className={`shrink-0 ${c.iconColor}`}
                  size={13}
                  strokeWidth={2}
                />
                <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  {c.label}
                </span>
              </div>

              {/* Primary Main Metric */}
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-[26px] leading-none font-black text-slate-800">
                  {total.toLocaleString()}
                </span>
              </div>

              {/* Bottom Sub-Metrics Layout */}
              <div className="flex gap-4 text-[10px]">
                {/* Shortage Item */}
                <span className="flex flex-col">
                  <span className={`font-black ${isShortageOk ? "text-emerald-600" : "text-red-700"}`}>
                    {isShortageOk ? "OK" : shortage.toLocaleString()}
                  </span>
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Short</span>
                </span>
                
                <span className="text-slate-200">|</span>
                
                {/* Overdue/Pending Item */}
                <span className="flex flex-col">
                  <span className={`font-black ${isOverdueOk ? "text-slate-400" : "text-amber-700"}`}>
                    {isOverdueOk ? "SCHED" : overdue.toLocaleString()}
                  </span>
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Overdue</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
