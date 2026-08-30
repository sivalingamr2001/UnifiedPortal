// src/layout/AppHeader.tsx
import React from "react";
import { ChevronRight, Cpu, House } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCommodity } from "../context/CommodityProvider";

const BADGE_STYLE: Record<string, string> = {
  T1a: "bg-red-100 text-red-700 border-red-300",
  T1b: "bg-amber-100 text-amber-700 border-amber-300",
  T2: "bg-slate-100 text-slate-600 border-slate-300",
};

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardMetrics } = useCommodity();

  const badges = [
    { label: "T1a", value: dashboardMetrics?.TOTAL_TRACK_1A },
    { label: "T1b", value: dashboardMetrics?.TOTAL_TRACK_1B },
    { label: "T2", value: dashboardMetrics?.TOTAL_TRACK_2 },
  ];

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div
      className="flex items-center gap-3 px-5 py-2.5 shrink-0 select-none"
      style={{ background: "linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(124, 58, 237) 100%)" }}
    >
      <button
        className="flex shrink-0 items-center gap-1 rounded-full p-1.5 text-violet-200 transition-colors hover:bg-white/10"
        title="Home"
        onClick={() => navigate("/")}
      >
        <House className="h-4 w-4" />
      </button>

      <ChevronRight size={11} strokeWidth={2} className="text-violet-400" />
      <Cpu size={15} strokeWidth={2} className="text-violet-300" />

      <div>
        <div className="text-white font-black text-[13px] leading-tight">Commodity Custodian</div>
        <div className="text-violet-300 text-[10px]">Component &amp; Vendor Management</div>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${BADGE_STYLE[b.label]}`}
            >
              {b.label}: {(b.value ?? 0).toLocaleString()}
            </span>
          ))}
        </div>

        <span className="text-[9px] text-violet-300 font-mono">{today}</span>
      </div>
    </div>
  );
};
