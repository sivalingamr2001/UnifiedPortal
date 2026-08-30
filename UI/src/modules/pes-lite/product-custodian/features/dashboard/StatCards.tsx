import { usePes } from "../../context/PesProvider"
import {
  ChartNoAxesColumn,
  Layers,
  ShieldAlert
} from "lucide-react"
import { useMemo } from "react"

interface StatCardsProps {
  custodianName?: string
  orgId?: number | string
}

export const StatCards = ({ custodianName, orgId }: StatCardsProps) => {
  const { dashboardData, data: items } = usePes()

  // Safely map from dashboardData with fallback values
  const data = dashboardData || {}
  
  const activeAms1Items = Number(data.ACTIVEAMS1ITEMS || 0)
  const totalAms1Items = Number(data.AMS1_TOTAL || 0)
  const activeAms2Items = Number(data.ACTIVEAMS2ITEMS || 0)
  const totalAms2Items = Number(data.AMS2_TOTAL || 0)
  const totalDemand = Number(data.DEMAND || 0)
  const totalSo = Number(data.SO_QTY || 0)
  const totalBin = Number(data.BIN_QTY || 0)
  const exceptionQtySumForConstraint = Number(data.EXCEPTIONQTYSUMFORCONSTRAINT || 0)
  const reqQtySumForConstraint = Number(data.REQQTYSUMFORCONSTRAINT || 0)
  const exceptionQtySumForUnConstraint = Number(data.EXCEPTIONQTYSUMFORUNCONSTRAINT || 0)
  const reqQtySumForUnConstraint = Number(data.REQQTYSUMFORUNCONSTRAINT || 0)

  // Compute the user-friendly Org text (e.g., "I21") from the active data structure
  const activeOrgName = useMemo(() => {
    if (!orgId || orgId === "ALL" || !items) return null
    const matchedItem = items.find(item => String(item.ORGANIZATION_ID) === String(orgId))
    return matchedItem ? matchedItem.ORG : null
  }, [orgId, items])

  // Dynamic status text for screen readers / tooltips
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    parts.push(custodianName?.trim() ? custodianName : "All custodians")
    if (activeOrgName) {
      parts.push(`Org: ${activeOrgName}`)
    }
    return parts.join(" | ")
  }, [custodianName, activeOrgName])

  return (
    <div className="shrink-0 px-4 pt-2.5 pb-2" title={`Dashboard metrics for ${filterSummary}`}>
      <div className="grid grid-cols-4 gap-2.5">
        {/* Card 1 */}
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(5, 150, 105), rgb(16, 185, 129))",
            }}
          ></div>
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Layers
                className="shrink-0 text-emerald-600"
                size={13}
                strokeWidth={2}
              />
              <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                OA/BIN Items vs Catalog
              </span>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] font-bold text-blue-600">
                  AMS1
                </span>
                <span
                  className="text-[13px] font-black text-slate-700"
                >
                  {activeAms1Items.toLocaleString()}
                  <span className="font-normal text-slate-400">/{totalAms1Items.toLocaleString()}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${totalAms1Items > 0 ? Math.round((activeAms1Items / totalAms1Items) * 100) : 0}%` }}
                ></div>
              </div>
              <div className="mt-0.5 text-right text-[10px] text-slate-400">
                {totalAms1Items > 0 ? `${Math.round((activeAms1Items / totalAms1Items) * 100)}% active` : "0% active"}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="rounded bg-violet-50 px-1 py-0.5 text-[10px] font-bold text-violet-600">
                  AMS2
                </span>
                <span
                  className="text-[13px] font-black text-slate-700"
                >
                  {activeAms2Items.toLocaleString()}
                  <span className="font-normal text-slate-400">/{totalAms2Items.toLocaleString()}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${totalAms2Items > 0 ? Math.round((activeAms2Items / totalAms2Items) * 100) : 0}%` }}
                ></div>
              </div>
              <div className="mt-0.5 text-right text-[10px] text-slate-400">
                {totalAms2Items > 0 ? `${Math.round((activeAms2Items / totalAms2Items) * 100)}% active` : "0% active"}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(20, 96, 170), rgb(26, 128, 217))",
            }}
          ></div>
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <ChartNoAxesColumn
                className="shrink-0 text-blue-600"
                size={13}
                strokeWidth={2}
              />
              <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                Demand (SO + BIN)
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-[26px] leading-none font-black text-slate-800">
                {totalDemand.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4 text-[10px]">
              <span className="flex flex-col">
                <span className="font-black text-blue-700">{totalSo.toLocaleString()}</span>
                <span className="text-slate-400">SO</span>
              </span>
              <span className="text-slate-200">|</span>
              <span className="flex flex-col">
                <span className="font-black text-violet-700">{totalBin.toLocaleString()}</span>
                <span className="text-slate-400">BIN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(220, 38, 38), rgb(154, 52, 18))",
            }}
          ></div>
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldAlert
                className="shrink-0 text-red-600"
                size={13}
                strokeWidth={2}
              />
              <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                Exception vs Constraint
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-[32px] leading-none font-black text-red-600">
                {exceptionQtySumForConstraint.toLocaleString()}
              </span>
              <span className="text-[13px] text-slate-400">/ {reqQtySumForConstraint.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Constrained demand items qty
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(220, 38, 38), rgb(154, 52, 18))",
            }}
          ></div>
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldAlert
                className="shrink-0 text-red-600"
                size={13}
                strokeWidth={2}
              />
              <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                Exception vs Un-Constraint
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-[32px] leading-none font-black text-red-600">
                {exceptionQtySumForUnConstraint.toLocaleString()}
              </span>
              <span className="text-[13px] text-slate-400">/ {reqQtySumForUnConstraint.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              un-constrained demand items qty
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
