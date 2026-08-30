interface MetricSummaryCardsProps {
  reqQty: number
  exceptionQty: number
  demand: number
  fulfilledCount: number
  isConstrained: boolean
  viewMode?: "action" | "all"
  variant: "top-compact" | "bottom-summary"
}

export const MetricSummaryCards = ({ reqQty, exceptionQty, demand, fulfilledCount, isConstrained, viewMode, variant }: MetricSummaryCardsProps) => {
  if (variant === "top-compact") {
    return (
      <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-slate-100 bg-white px-4 py-2.5 md:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Demand", value: demand, tone: "blue" },
          { label: "Fulfilled", value: fulfilledCount, tone: "emerald" },
          { label: "Req Qty", value: reqQty, tone: "slate" },
          { label: "Exception Qty", value: exceptionQty, tone: "slate" }
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg border border-slate-100 px-3 py-1.5 text-center ${stat.tone === "blue" ? "bg-blue-50/60" : stat.tone === "emerald" ? "bg-emerald-50/60" : "bg-slate-50"}`}>
            <div className="text-base leading-none font-black text-slate-700">{stat.value?.toLocaleString()}</div>
            <div className="mt-0.5 text-[8px] tracking-wider uppercase text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <div className="h-3.5 w-1 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Commitment summary</span>
        <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          {viewMode === "action" ? "Action view" : "All lines view"}
        </span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {[
          { title: "Current Required", value: reqQty?.toLocaleString(), tone: "blue" },
          { title: "Pending Exceptions", value: exceptionQty?.toLocaleString(), tone: "amber" },
          { title: "Constraint Status", value: isConstrained ? "Yes" : "No", tone: "red" },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl border border-slate-100 p-3 text-center ${card.tone === "blue" ? "bg-blue-50/30" : card.tone === "amber" ? "bg-amber-50/30" : "bg-red-50/30"}`}>
            <div className="text-[20px] font-black text-slate-700">{card.value}</div>
            <div className="mt-1 text-[9px] font-bold uppercase text-slate-500">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
