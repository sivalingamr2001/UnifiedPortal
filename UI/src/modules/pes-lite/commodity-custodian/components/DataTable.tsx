import { themeBalham, type ColDef, type ColGroupDef, type GetRowIdFunc } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";

interface DataTableProps<T> {
    rowData: T[];
    columnDefs: (ColDef<T> | ColGroupDef<T>)[];
    getRowId: GetRowIdFunc<T>;
    loading?: boolean;
    error?: string | null;
    context?: Record<string, unknown>;
    headerHeight?: number;
    rowHeight?: number;
    groupHeaderHeight?: number;
    emptyMessage?: string;
}

const DEFAULT_COL_DEF: ColDef = {
    resizable: true,
    suppressMovable: true,
    wrapHeaderText: false,
    autoHeaderHeight: false,
    wrapText: false,
    cellClass: "text-xs whitespace-nowrap overflow-hidden",
    headerClass: "text-xs font-semibold text-slate-700 whitespace-nowrap",
};

export function DataTable<T>({
    rowData,
    columnDefs,
    getRowId,
    loading,
    error,
    context,
    headerHeight = 24,
    rowHeight = 45,
    groupHeaderHeight = 26
}: DataTableProps<T>) {
    const defaultColDef = useMemo(() => DEFAULT_COL_DEF, []);

    if (loading) {
        return (
            <div className="flex flex-1  w-full items-center justify-center border border-slate-100 bg-white rounded-b-[8px]">
                <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading data…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1  w-full items-center justify-center border border-red-100 bg-red-50 rounded-b-[8px] p-3 text-center">
                <span className="text-xs font-bold text-red-600">{error}</span>
            </div>
        );
    }

    if (rowData.length === 0) {
        return (
            <div className="flex flex-1  w-full items-center justify-center border border-slate-100 bg-white rounded-b-[8px]">
                <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading data…</span>
            </div>
        );
    }

    return (
        <div className="ag-theme-quartz w-full text-xs rounded-[6px] border border-slate-100 bg-white shadow-[0_12px_24px_-4px_rgba(0,0,0,0.02)]">
            <div style={{ height: "439px", width: "100%", borderRadius: 'none' }}>
                <AgGridReact<T>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    context={context}
                    getRowId={getRowId}
                    headerHeight={headerHeight}
                    groupHeaderHeight={groupHeaderHeight}
                    rowHeight={rowHeight}
                    suppressCellFocus
                    animateRows
                    theme={themeBalham}
                />
            </div>
        </div>
        // <div className="ag-theme-custom-style max-h-[405px] relative flex w-full flex-col rounded-b-[10px] border border-slate-100 bg-white shadow-[0_12px_24px_-4px_rgba(0,0,0,0.02)]">
        //     {loading && (
        //         <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        //             <Loader isText={true} />
        //         </div>
        //     )}
        //     <div style={{ height: "378px", width: "100%" }}>
        //         <AgGridReact
        //             loading={loading}
        //             theme={themeBalham}
        //             rowData={rowData}
        //             columnDefs={columnDefs}
        //             defaultColDef={defaultColDef}
        //             rowHeight={38}
        //             headerHeight={36}
        //             suppressCellFocus={true}
        //         />
        //     </div>
        // </div>
    );
}