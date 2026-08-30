import { commodityApi, type ComponentVsProductData } from "../api/commodityApi";
import { Loader } from "@/shared/components/Loader";
import { TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductModalProps {
    open: boolean;
    organizationId: number | null;
    organization: string | null;
    itemNo: string | null;
    onClose: () => void;
}

export default function ProductModal({ open, organizationId, organization, itemNo, onClose }: ProductModalProps) {
    const [data, setData] = useState<ComponentVsProductData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || organizationId == null || !itemNo) return;

        const fetchProductLinkages = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await commodityApi.getComponentVsProduct(organizationId, itemNo);
                setData(res.data || []);
            } catch (err) {
                console.error("Error fetching component vs product records:", err);
                setError("Failed to fetch product mapping associations.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductLinkages();
    }, [open, organizationId, itemNo]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl flex flex-col max-h-[85vh] border border-slate-100 overflow-hidden font-sans">

                {/* Header Segment */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div>
                        <h3 className="text-xs font-bold text-slate-800">Product Mapping</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Component: {itemNo} | Org: {organization}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Content Container Area */}
                <div className="flex-1 overflow-auto p-4 min-h-[200px] flex flex-col justify-center">
                    {loading ? (
                        <div className="flex items-center justify-center flex-col gap-2 py-8">
                            <Loader isText={true} />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg inline-block">
                                {error}
                            </span>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-8 text-xs font-medium text-slate-400">
                            No matching product tracking links found for this item selection.
                        </div>
                    ) : (
                        <div className="w-full border border-slate-100 rounded-lg overflow-hidden shadow-xs">
                            <table className="w-full text-[11px] text-left border-collapse">
                                <thead className="bg-slate-50/70 text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 text-center">Schedule Month</th>
                                        <th className="px-3 py-2">Input Item No</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="px-3 py-2">Component Code</th>
                                        <th className="px-3 py-2 text-right">Shortage Qty</th>
                                        <th className="px-3 py-2 text-center">Constraint Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {data.map((row, idx) => {
                                        const isConstrained = row.CONSTRAINT_FLAG === "CONSTRAINT";
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-3 py-2 text-center font-mono text-slate-500">{row.SCHEDULE_MONTH}</td>
                                                <td className="px-3 py-2 font-mono text-violet-700 font-bold">{row.INPUT_ITEM_NO}</td>
                                                <td className="px-3 py-2 font-mono text-violet-700 font-bold">{row.DESCRIPTION}</td>
                                                <td className="px-3 py-2 font-mono text-slate-600">{row.COMPONENT_NO}</td>
                                                <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                                                    {Number(row.PEGGING_SHORTAGE_QTY).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${isConstrained
                                                        ? "bg-red-50 text-red-600 border-red-100"
                                                        : "bg-emerald-50 text-emerald-500 border-slate-200"
                                                        }`}>
                                                        {isConstrained && <TriangleAlert size={8} className="fill-red-50" />}
                                                        {row.CONSTRAINT_FLAG}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
