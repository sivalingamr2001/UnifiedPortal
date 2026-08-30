import { pesApi } from "../../api/pesApi";
import { Badge } from "@/shared/components/ui/badge";
import { Boxes } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ComponentPeggingDialog } from "../ItemDetails/ComponentPeggingDialog";
import { DetailHeader } from "../ItemDetails/DetailHeader";
import { MetricSummaryCards } from "../ItemDetails/MetricSummaryCards";
import type { ItemDetailsPageProps } from "../ItemDetails/types";
import { toast } from "sonner";

const formatTargetMonth = (yearMonthStr: string | number | null | undefined): string => {
    if (!yearMonthStr) return "—";
    const str = yearMonthStr.toString().trim();
    if (str.length !== 6) return str;
    const year = str.substring(0, 4);
    const monthIndex = parseInt(str.substring(4, 6), 10) - 1;
    if (monthIndex < 0 || monthIndex > 11) return str;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[monthIndex]} '${year.substring(2)}`;
};

const getYearMonthValue = (date: Date): string => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}${month}`;
};

const formatYearMonthLabel = (value: string | null | undefined): string => {
    if (!value) return "—";
    const str = value.toString().trim();
    if (str.length !== 6) return str;
    const year = str.substring(0, 4);
    const month = parseInt(str.substring(4, 6), 10);
    const date = new Date(Number(year), month - 1, 1);
    const monthLabel = date.toLocaleString("en-US", { month: "short" });
    return `${monthLabel} '${year.substring(2)}`;
};

const formatOrderDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "—";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
        return "—";
    }
};

export const ItemDetails = ({ item, itemDetails, onBack }: ItemDetailsPageProps) => {
    const [componentModalOpen, setComponentModalOpen] = useState(false);
    const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());
    const [custodianMonthByRow, setCustodianMonthByRow] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [componentDialogLineId, setComponentDialogLineId] = useState<number>(0);
    const [componentDialogOrderedItem, setComponentDialogOrderedItem] = useState<string>(item.ORDERED_ITEM);
    const selectedCount = checkedRows.size;
    const rowKeys = itemDetails.map((detail: any) => `${detail.HEADER_ID}-${detail.LINE_ID}`);
    const allRowsSelected = itemDetails.length > 0 && selectedCount === rowKeys.length;
    const someRowsSelected = selectedCount > 0 && selectedCount < rowKeys.length;
    const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

    const toggleSelectAll = () => {
        if (allRowsSelected) {
            clearSelection();
            return;
        }

        setCheckedRows(new Set(rowKeys));
    };

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = someRowsSelected;
        }
    }, [someRowsSelected]);

    const monthsList = useMemo(() => {
        const current = new Date();
        const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        return [
            { value: getYearMonthValue(current), label: formatYearMonthLabel(getYearMonthValue(current)) },
            { value: getYearMonthValue(next), label: formatYearMonthLabel(getYearMonthValue(next)) },
        ] as const;
    }, []);

    const [selectedMonth, setSelectedMonth] = useState<string>("");

    useEffect(() => {
        if (monthsList.length > 0) setSelectedMonth(monthsList[0].value);
    }, [monthsList]);

    const isConstrained = item.CONSTRAINT === "CONSTRAINT" || item.CONSTRAINT === "CONSTRAINED";
    const isAms1 = item.AMS_CAT === "AMS1" || item.AMS_CAT === "AMS-1";
    const customerCategory = itemDetails[0]?.CUSTOMER_CATEGORGY;
    const orderedItem = item.ORDERED_ITEM;
    const demand = (item.SO_QTY ?? 0) + (item.BIN_QTY ?? 0) + (item.AMS1_TOTAL ?? 0);
    const fulfilledCount = itemDetails.filter((detail) => detail.PROD_COMMIT_MONTH != null && detail.PROD_COMMIT_MONTH !== "").length;

    // Add this hook inside your ItemDetails component
    useEffect(() => {
        if (itemDetails && itemDetails.length > 0) {
            const initialMonths: Record<string, string> = {};

            itemDetails.forEach((detail: any) => {
                const rowKey = `${detail.HEADER_ID}-${detail.LINE_ID}`;
                // Use HO_TARGET_MONTH if present, otherwise fallback to the current month string
                initialMonths[rowKey] = detail.HO_TARGET_MONTH?.toString() || monthsList[0].value;
            });

            setCustodianMonthByRow(initialMonths);
        }
    }, [itemDetails, monthsList]);

    const toggleRowChecked = (key: string) => {
        setCheckedRows((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const clearSelection = () => setCheckedRows(new Set());

    const setRowCustodianMonth = (key: string, month: string) => {
        setCustodianMonthByRow((prev) => ({ ...prev, [key]: month }));
    };

    const applyMonthToSelectedRows = (monthValue: string) => {
        if (checkedRows.size === 0) return;

        setCustodianMonthByRow((prev) => {
            const next = { ...prev };
            checkedRows.forEach((key) => {
                next[key] = monthValue;
            });
            return next;
        });
    };

    const handleRowSubmission = async () => {
        if (checkedRows.size === 0) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const selectedRows = Array.from(checkedRows)
                .map((key) => ({
                    key,
                    row: itemDetails.find((detail) => `${detail.HEADER_ID}-${detail.LINE_ID}` === key),
                }))
                .filter((entry) => entry.row);

            if (selectedRows.length === 0) {
                setSubmitError("No valid rows were selected.");
                return;
            }

            const updates = selectedRows
                .flatMap(({ row, key }) => {
                    const lineId = row?.LINE_ID;
                    const selectedMonthValue = custodianMonthByRow[key] ?? selectedMonth;

                    if (typeof lineId !== "number" || !selectedMonthValue) {
                        return [];
                    }

                    return [{
                        lineId,
                        rsvSource: row?.RSV_SOURCE ?? undefined,
                        selectedMonth: selectedMonthValue,
                    }];
                });

            if (updates.length === 0) {
                setSubmitError("Please select at least one line with a month assignment.");
                return;
            }

            const response = await pesApi.updateProdCommitDate({ updates });
            toast.success("Successfully submitted.");
            onBack();
            if (response?.updatedRows !== undefined) {
                clearSelection();
            }
        } catch (error) {
            console.error("Batch submission pipeline failed:", error);
            setSubmitError("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col h-[600px] rounded-[10px] overflow-auto shadow-lg bg-white">

            <div className="shrink-0 border-b border-slate-100 shadow-sm">
                <DetailHeader
                    orderedItem={item.ORDERED_ITEM}
                    description={item.DESCRIPTION}
                    isAms1={isAms1}
                    isConstrained={isConstrained}
                    onBack={onBack}
                />

                <div className="shrink-0">
                    <MetricSummaryCards
                        reqQty={item.REQ_QTY}
                        exceptionQty={item.EXCEPTION_QTY}
                        demand={demand}
                        fulfilledCount={fulfilledCount}
                        isConstrained={isConstrained}
                        variant="top-compact"
                    />
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-auto bg-slate-50 p-4 shadow-inner">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5">
                        <div className="h-3.5 w-1 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Sales Order Breakup</span>
                        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
                            Live detail view
                        </Badge>
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Bulk assign</span>
                                <button
                                    type="button"
                                    onClick={() => applyMonthToSelectedRows(monthsList[0].value)}
                                    disabled={selectedCount === 0}
                                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {monthsList[0].label}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyMonthToSelectedRows(monthsList[1].value)}
                                    disabled={selectedCount === 0}
                                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {monthsList[1].label}
                                </button>
                            </div>
                            <div className="mx-0.5 h-4 w-px bg-slate-200"></div>
                            {selectedCount > 0 && (
                                <div className="flex items-center gap-1.5 transition-all animate-in fade-in duration-200">

                                    {/* Optional Error Status Tag */}
                                    {submitError && (
                                        <span className="text-[10px] font-semibold text-red-600 mr-2 self-center" title={submitError}>
                                            {submitError}
                                        </span>
                                    )}

                                    {/* Standalone Cancel Button */}
                                    <button
                                        type="button"
                                        onClick={clearSelection}
                                        className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[9px] font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                                    >
                                        Cancel
                                    </button>

                                    {/* Standalone Submit Changes Button */}
                                    <button
                                        type="button"
                                        onClick={handleRowSubmission}
                                        disabled={isSubmitting}
                                        className="rounded-full bg-emerald-600 px-3.5 py-1 text-[9px] font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Changes"}
                                    </button>

                                </div>)}
                        </div>
                    </div>

                    <div className="overflow-x-auto p-3">
                        <table className="w-full min-w-[1000px] border-collapse text-[11px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-100/60 text-center text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                    <th colSpan={7} className="px-3 py-2 text-slate-400 border-r border-slate-200/60">ORDER DETAILS</th>
                                    <th colSpan={4} className="px-3 py-2 text-slate-400">FULFILLMENT MONTH SELECTION</th>
                                </tr>
                                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[10px] font-semibold">
                                    <th className="w-10 px-3 py-2 text-center">
                                        <input
                                            ref={headerCheckboxRef}
                                            type="checkbox"
                                            checked={allRowsSelected}
                                            onChange={toggleSelectAll}
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-3 py-2 text-left">Source</th>
                                    {/* <th className="px-3 py-2 text-left">Line ID</th> */}
                                    <th className="px-3 py-2 text-left">Cat</th>
                                    <th className="px-3 py-2 text-left">Sales Order No</th>
                                    <th className="px-3 py-2 text-center">Ord FF Date</th>
                                    <th className="px-3 py-2 text-left">Item Code</th>
                                    <th className="px-3 py-2 text-right border-r border-slate-200/60">Req Qty</th>
                                    <th className="px-3 py-2 text-center">Branch Planner</th>
                                    <th className="px-3 py-2 text-center">HO Planner</th>
                                    <th className="px-3 py-2 text-center">Product Custodian</th>
                                    <th className="px-3 py-2 text-center">Component Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                                {itemDetails.map((detail: any) => {
                                    const rowKey = `${detail.HEADER_ID}-${detail.LINE_ID}`;
                                    const isChecked = checkedRows.has(rowKey);
                                    const activeRowMonth = custodianMonthByRow[rowKey] ?? selectedMonth;

                                    return (
                                        <tr key={rowKey} className={`transition hover:bg-slate-50/40 ${isChecked ? "bg-emerald-50/20" : ""}`}>
                                            <td className="px-3 py-2 text-center">
                                                <input type="checkbox" checked={isChecked} onChange={() => toggleRowChecked(rowKey)} className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer" />
                                            </td>
                                            <td className="px-3 py-2 text-left text-slate-800 font-semibold">{detail.RSV_SOURCE || "SO"}</td>
                                            {/* <td className="px-3 py-2 text-left text-slate-800 font-semibold">{detail.LINE_ID || "SO"}</td> */}
                                            <td className="px-3 py-2 text-left">
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{customerCategory || "—"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-left truncate max-w-[180px]" title={detail.ORDER_NUMBER}>{detail.ORDER_NUMBER}</td>
                                            <td className="px-3 py-2 text-center text-slate-400">{formatOrderDate(detail.ORD_FF_DT)}</td>
                                            <td className="px-3 py-2 text-left font-bold text-blue-600">{orderedItem}</td>
                                            <td className="px-3 py-2 text-right font-bold text-slate-700 border-r border-slate-200/60">{(detail.TO_BE_MFG ?? 0).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-center font-bold text-slate-700">{formatTargetMonth(detail.BRANCH_TARGET_MONTH)}</td>
                                            <td className="px-3 py-2 text-center font-bold text-slate-700">
                                                {formatTargetMonth(detail.HO_TARGET_MONTH)}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="relative inline-flex rounded-full bg-slate-100 p-0.5">
                                                    {/* Background slider pill indicator */}
                                                    <div
                                                        className="absolute top-0.5 bottom-0.5 rounded-full bg-emerald-600 transition-all duration-300 ease-out"
                                                        style={{
                                                            left: activeRowMonth === monthsList[0].value ? "2px" : "calc(50% + 1px)",
                                                            width: "calc(50% - 3px)"
                                                        }}
                                                    />
                                                    {monthsList.map((monthOption) => (
                                                        <button
                                                            key={monthOption.value}
                                                            type="button"
                                                            onClick={() => setRowCustodianMonth(rowKey, monthOption.value)}
                                                            className={`relative z-10 flex w-16 items-center justify-center px-2 py-0.5 text-[10px] font-semibold transition-colors duration-200 select-none disabled:cursor-not-allowed disabled:opacity-50 ${activeRowMonth === monthOption.value ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                                                                }`}
                                                        >
                                                            {monthOption.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setComponentDialogLineId(detail.LINE_ID);
                                                        setComponentDialogOrderedItem(detail.ORDERED_ITEM || orderedItem);
                                                        setComponentModalOpen(true);
                                                    }}
                                                    className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-bold text-violet-700 transition-colors hover:bg-violet-100 mx-auto"
                                                >
                                                    <Boxes className="mr-1 h-3 w-3" />View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <ComponentPeggingDialog
                isOpen={componentModalOpen}
                onOpenChange={setComponentModalOpen}
                orderedItem={componentDialogOrderedItem}
                LineId={componentDialogLineId}
            />
        </div>
    );
};
