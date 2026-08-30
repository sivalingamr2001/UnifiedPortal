import { ArrowLeft, ChevronRight, Shield, TriangleAlert } from "lucide-react";
import type { DetailHeaderProps } from "./types";

export const DetailHeader = ({ orderedItem, description, isAms1, isConstrained, onBack }: DetailHeaderProps) => {
    return (
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-gray-100 px-4 py-2 shadow-sm">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-blue-700"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Items
            </button>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-[12px] font-black text-blue-700">{orderedItem}</span>
            <span className="hidden text-[11px] text-slate-400 md:block">{description}</span>
            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-px text-[10px] font-bold text-blue-700">
                {isAms1 ? "AMS1" : "AMS2"}
            </span>
            <span
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors ${isConstrained
                    ? "border-red-300 bg-red-100 text-red-700" // Red for Constraint
                    : "border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200" // Green for Un Constraint
                    }`}
            >
                {isConstrained ? (
                    <TriangleAlert className="h-3 w-3" />
                ) : (
                    <Shield className="h-3 w-3" />
                )}
                {isConstrained ? "Constraint" : "Un-Constraint"}
            </span>
        </div>
    );
};
