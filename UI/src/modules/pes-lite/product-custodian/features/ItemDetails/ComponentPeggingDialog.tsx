import { Badge } from "@/shared/components/ui/badge"
import { Boxes, X } from "lucide-react"
import type { ComponentPeggingDialogProps } from "./types"
import { useEffect, useState } from "react"
import { pesApi, type PesComponentDetails } from "../../api/pesApi"
import { useLoader } from "@/shared/hooks/useLoader"
import { Checkbox } from "@/shared/components/ui/checkbox"

export const ComponentPeggingDialog = ({ isOpen, onOpenChange, orderedItem, LineId }: ComponentPeggingDialogProps) => {
    const [componentData, setComponentData] = useState<PesComponentDetails[]>([])
    const [constraintOnly, setConstraintOnly] = useState(false)
    const { loading, withLoader } = useLoader()
    const [error, setError] = useState<string | null>(null)

    const loadComponentData = async () => {
        setError(null)
        try {
            const response: any = await withLoader(() => pesApi.getComponentDetails(LineId))
            const componentArray = response?.data ?? []
            setComponentData(Array.isArray(componentArray) ? componentArray : [])
        } catch (err) {
            console.error("Error loading component data:", err)
            setError(err instanceof Error ? err.message : "Failed to load component data")
            setComponentData([])
        }
    }

    const filteredComponentData = constraintOnly
        ? componentData.filter(
            (comp) =>
                comp.CONSTRAINT_FLAG !== "UN-CONSTRAINT" && comp.CONSTRAINT_FLAG !== "UN-CONSTRAINED"
        )
        : componentData

    useEffect(() => {
        if (isOpen) {
            loadComponentData()
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [orderedItem, isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
            <div className="flex h-[90vh] w-[95vw] flex-col rounded-xl border border-slate-100 bg-white shadow-2xl overflow-hidden">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Boxes className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-bold tracking-tight text-slate-800">
                            Component Details for{" "}
                            <span className="font-extrabold text-blue-700 font-mono">{orderedItem}</span>
                        </span>
                        <label className="ml-2 flex cursor-pointer items-center gap-1.5 select-none">
                            <Checkbox
                                id="pending-checkbox"
                                checked={constraintOnly}
                                onCheckedChange={(checked) => setConstraintOnly(!!checked)}
                                className="h-3.5 w-3.5 rounded-[3px] border-slate-300 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
                            />
                            <span className="text-[10px] font-bold tracking-wide text-amber-700">
                                Constraint only
                            </span>
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-white">
                    <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm w-full">
                        {loading ? (
                            <p className="text-sm text-slate-500 p-8 text-center font-medium">Loading component data...</p>
                        ) : error ? (
                            <p className="text-sm text-red-500 p-8 text-center font-medium">Error: {error}</p>
                        ) : filteredComponentData.length === 0 ? (
                            <p className="text-sm text-slate-500 p-8 text-center font-medium">No structural assembly dependencies discovered.</p>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse table-auto min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="px-4 py-3 text-center">ORG</th>
                                        <th className="px-4 py-3 text-left">SOURCE ORG</th>
                                        <th className="px-4 py-3">Input Item</th>
                                        <th className="px-4 py-3">Component No</th>
                                        {/* <th className="px-4 py-3">Line Id</th> */}
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Commodity</th>
                                        <th className="px-4 py-3 text-center">Source Type</th>
                                        <th className="px-4 py-3 text-center">CMG RSP</th>
                                        <th className="px-4 py-3 text-center">Flag</th>
                                        <th className="px-4 py-3 text-center">Level Flag</th>
                                        <th className="px-4 py-3 text-right pr-8">Shortage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium text-xs">
                                    {filteredComponentData.map((comp, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors h-10">
                                            <td className="px-4 py-2 text-slate-500">{comp.ORG || "—"}</td>
                                            <td className="px-4 py-2 text-slate-500">{comp.SOURCE_ORG || "—"}</td>
                                            <td className="px-4 py-2 font-mono text-slate-500">{comp.INPUT_ITEM_NO}</td>
                                            <td className="px-4 py-2 font-semibold text-blue-700">{comp.COMPONENT_NO}</td>
                                            {/* <td className="px-4 py-2 font-semibold text-blue-700">{comp.LINE_ID}</td> */}
                                            <td className="px-4 py-2 text-slate-400 max-w-[320px] truncate" title={comp.DESCRIPTION}>{comp.DESCRIPTION}</td>
                                            <td className="px-4 py-2 text-slate-500">{comp.COMMODITY || "—"}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 border-none shadow-none text-[10px] rounded-[4px] px-2 py-0.5">
                                                    {comp.SOURCE_TYPE || "—"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-slate-500">{comp.CMG_RSP || "—"}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge className={`text-[10px] shadow-none rounded-full px-2.5 py-0.5 border font-semibold ${comp.CONSTRAINT_FLAG === "UN-CONSTRAINT" || comp.CONSTRAINT_FLAG === "UN-CONSTRAINED"
                                                    ? "bg-emerald-50/60 text-emerald-700 border-emerald-100"
                                                    : "bg-red-50/60 text-red-700 border-red-100"
                                                    }`}>
                                                    {comp.CONSTRAINT_FLAG || "UN-CONSTRAINT"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-900 pr-8">{comp.FIRST_LEVEL_FLAG?.toLocaleString() || 0}</td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-900 pr-8">{comp.SHORTAGE_QTY?.toLocaleString() || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
