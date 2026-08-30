import { Loader } from "@/shared/components/Loader"
import { Badge } from "@/shared/components/ui/badge"
import type { ColDef, RowClassParams } from "ag-grid-community"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeMaterial
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { useMemo } from "react"
import type { PesConsolidatedData } from "../../api/pesApi"

ModuleRegistry.registerModules([AllCommunityModule])

interface Props {
  items: PesConsolidatedData[]
  onRowClick?: (item: PesConsolidatedData) => void
  onFilterChange?: (custodianName: string | null) => void
  loading?: boolean
}

const fmt = (n: number | null) =>
  n === null || n === undefined ? <span className="text-slate-300">—</span> : n.toLocaleString()

const getFilteredColumnTotal = (
  params: any,
  field: any,
  items: PesConsolidatedData[]
): string => {
  let sum = 0
  let count = 0

  if (params?.api?.forEachNodeAfterFilter) {
    params.api.forEachNodeAfterFilter((node: any) => {
      if (!node?.data) return
      const val = Number(node.data[field])
      if (!Number.isNaN(val)) {
        sum += val
        count += 1
      }
    })
  } else {
    items.forEach((row: any) => {
      const val = Number(row[field])
      if (!Number.isNaN(val)) {
        sum += val
        count += 1
      }
    })
  }

  return `Total: ${sum.toLocaleString()}  |  Rows: ${count}`
}

export const ItemTable = ({ items, onRowClick, onFilterChange, loading }: Props) => {
  const customTheme = useMemo(() => {
    return themeMaterial.withParams({
      borderColor: "transparent",
      headerBackgroundColor: "#F8FAFC",
     })
  }, [])

  const columnDefs = useMemo<ColDef<PesConsolidatedData>[]>(
    () => [
      {
        headerName: "ORG",
        field: "ORG",
        minWidth: 70,
        flex: 1,
        cellClassName: "font-semibold tracking-tight text-slate-800 pl-4 pr-2 py-2 text-[11px] flex items-center",
        headerClass: "pl-4 pr-2 py-2",
      },
      {
        headerName: "Item Code",
        field: "ORDERED_ITEM",
        minWidth: 110,
        flex: 1.5,
        filter: true,
        cellClassName: "font-semibold tracking-tight text-slate-800 px-2 py-2 text-[11px] flex items-center",
        headerClass: "px-2 py-2",
      },
      {
        headerName: "Description",
        field: "DESCRIPTION",
        minWidth: 160,
        flex: 3,
        cellClassName: "font-medium text-slate-500 px-2 py-2 text-[11px] flex items-center",
        headerClass: "px-2 py-2",
        cellRenderer: (params: any) => (
          <span className="truncate block w-full" title={params.value}>
            {params.value?.trim() || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        headerName: "Custodian",
        field: "CUSTODIAN_NAME",
        minWidth: 110,
        flex: 3,
        filter: true,
        cellClassName: "font-medium text-slate-500 px-3 py-2 text-[11px] truncate flex items-center",
        headerClass: "px-3 py-2",
        cellRenderer: (params: any) => (
          <span className="block line-clamp-15 wrap-break-word" title={params.value}>
            {params.value?.trim() || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        headerName: "Type",
        field: "AMS_CAT",
        width: 95,
        cellClassName: "px-2 py-2 flex items-center justify-start",
        headerClass: "px-2 py-2",
        cellRenderer: (params: any) => {
          const isAms1 = params.value === "AMS1" || params.value === "AMS-1";
          return (
            <Badge
              variant="outline"
              className={`rounded-[4px] border-none px-2 py-0.5 text-[9px] font-bold tracking-wide shadow-none ${isAms1 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                }`}
            >
              {isAms1 ? "AMS1" : "AMS2"}
            </Badge>
          );
        },
      },
      {
        headerName: "OCQ Qty",
        field: "OCQ_QTY",
        width: 95,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal(p, "REQ_QTY", items),
        cellClassName: "text-center font-medium text-slate-700 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value),
      },
      {
        headerName: "Req Qty",
        field: "REQ_QTY",
        width: 95,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal(p, "REQ_QTY", items),
        cellClassName: "text-center font-medium text-slate-700 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value),
      },
      {
        headerName: "Exception Qty",
        field: "EXCEPTION_QTY",
        width: 124,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal((p), "EXCEPTION_QTY", items),
        cellClassName: "text-center font-medium text-slate-700 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value),
        sortingOrder: ['desc', 'asc', null],
      },
      {
        headerName: "Last Month",
        field: "UPTO_LAST_MONTH",
        width: 110,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal(p, "UPTO_LAST_MONTH", items),
        // Removed all px and py spacing utilities completely
        cellClassName: "text-center font-medium text-slate-600 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value ?? 0),
      },
      {
        headerName: "This Month",
        field: "THIS_MONTH",
        width: 110,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal(p, "THIS_MONTH", items),
        // Removed all px and py spacing utilities completely
        cellClassName: "text-center font-semibold text-blue-600 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value ?? 0),
      },
      {
        headerName: "Next Month+",
        field: "NEXT_MONTH_ONWARDS",
        width: 130,
        headerTooltipValueGetter: (p) => getFilteredColumnTotal(p, "NEXT_MONTH_ONWARDS", items),
        // Removed all px and py spacing utilities completely
        cellClassName: "text-center font-medium text-slate-600 text-[11px] flex items-center justify-center",
        headerClass: "text-center cursor-help",
        cellRenderer: (params: any) => fmt(params.value ?? 0),
      },
      {
        headerName: "Level 5",
        field: "LEVEL_5",
        minWidth: 95,
        flex: 1,
        cellClassName: "font-semibold tracking-tight text-slate-800 px-2 py-2 text-[11px] flex items-center",
        headerClass: "px-2 py-2",
      },
      {
        headerName: "Constraint",
        field: "CONSTRAINT",
        minWidth: 115,
        flex: 1.2,
        cellClassName: "py-2 px-2 flex items-center gap-1 text-[11px]",
        headerClass: "py-2 px-2",
        cellRenderer: (params: any) => {
          const isConstrained = params.value === "CONSTRAINT";
          return (
            <div className="flex items-center h-full">
              {isConstrained ? (
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-full border-red-100 bg-[#fff5f5] px-2 py-0.5 text-[9px] font-medium text-red-500 shadow-none border"
                >
                  Constrained
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-full border-emerald-100 bg-[#f4fbf7] px-2 py-0.5 text-[9px] font-medium text-emerald-600 shadow-none border"
                >
                  Clear
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const getRowClass = (params: RowClassParams<PesConsolidatedData>) => {
    const base = "transition-colors duration-150 select-none border-b border-slate-100/40 "
    const isConstrained = params.data?.CONSTRAINT === "CONSTRAINT" || params.data?.CONSTRAINT === "CONSTRAINT";
    return isConstrained
      ? `${base} bg-[#fff8f8] hover:bg-[#fdeded]!`
      : `${base} bg-white hover:bg-slate-50/60!`
  }

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: true,
      headerClass: "text-[11px] font-semibold tracking-tight text-slate-500",
    }),
    []
  )

  const handleFilterChanged = (event: any) => {
    const filterModel = event?.api?.getFilterModel?.() ?? {}
    const custodianFilter = filterModel.CUSTODIAN_NAME

    if (!custodianFilter) {
      onFilterChange?.(null)
      return
    }

    const filterValue =
      typeof custodianFilter.filter === "string"
        ? custodianFilter.filter.trim()
        : Array.isArray(custodianFilter.values)
          ? custodianFilter.values.find((value: unknown) => typeof value === "string" && value.trim())?.trim() ?? null
          : null

    onFilterChange?.(filterValue)
  }

  return (
    <div className="ag-theme-custom-style max-h-[405px] relative flex w-full flex-col rounded-b-[10px] border border-slate-100 bg-white shadow-[0_12px_24px_-4px_rgba(0,0,0,0.02)]">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loader isText={true} />
        </div>
      )}
      <div style={{ height: "378px", width: "100%" }}>
        <AgGridReact
          loading={loading}
          theme={customTheme}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowClass={getRowClass}
          rowHeight={38}
          headerHeight={36}
          suppressCellFocus={true}
          onRowClicked={(event: any) => onRowClick?.(event.data)}
          onFilterChanged={handleFilterChanged}
        />
      </div>
    </div>
  )
}
