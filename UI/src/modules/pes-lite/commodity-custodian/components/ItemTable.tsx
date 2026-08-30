// src/components/ItemTable.tsx
import React, { useCallback, useMemo, useState } from "react";
import type { CommodityData } from "../api/commodityApi";
import { DataTable } from "../components/DataTable";
import ProductModal from "../components/ProductModal";
import SupplyModal from "../components/SupplyModal";
import { TriangleAlert } from "lucide-react";
import type { ColDef } from "ag-grid-community";

interface CompactBadgeProps {
  children: React.ReactNode;
  className?: string;
}
const CompactBadge: React.FC<CompactBadgeProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-extrabold tracking-wide uppercase border h-4 shadow-none ${className}`}>
    {children}
  </span>
);

interface ItemTableProps {
  items: CommodityData[];
  loading: boolean;
  onFilterChange?: (custodianName: string | null) => void;
}

function demandCol(
  field: keyof CommodityData,
  headerName: string,
  variant: 'current' | 'highlight' | 'projected'
): ColDef<CommodityData> {
  let textClass = 'text-slate-500 font-medium';
  let bgClass = 'bg-transparent';

  if (variant === 'current') {
    textClass = 'text-amber-600 font-bold';
  } else if (variant === 'highlight') {
    textClass = 'text-rose-500 font-black text-[11px] bg-rose-50/20';
  }

  return {
    headerName,
    field,
    flex: 1,
    minWidth: 45,
    headerClass: 'text-center text-[9px] font-bold text-slate-500 tracking-tight px-1',
    cellClass: `text-right font-mono text-[9px] border-r border-slate-100 last:border-r-0 px-1.5 flex items-center justify-end h-full ${textClass} ${bgClass}`,
    valueFormatter: (params) => {
      if (params.value === undefined || params.value === null || params.value === 0) return '-';
      return Number(params.value).toLocaleString();
    }
  };
}

const getRelativeMonthStr = (offset: number, isPlus = false) => {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  
  // Format as "MMM'YY" (e.g., "Jul'26")
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const year = new Intl.DateTimeFormat('en-US', { year: '2-digit' }).format(date);
  
  return `${month}'${year}${isPlus ? '+' : ''}`;
};

export default function ItemTable({ items, loading }: ItemTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<CommodityData | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalItem, setProductModalItem] = useState<CommodityData | null>(null);

  const handleViewSupply = useCallback((row: CommodityData) => {
    setModalItem(row);
    setModalOpen(true);
  }, []);

  const handleViewProduct = useCallback((row: CommodityData) => {
    setProductModalItem(row);
    setProductModalOpen(true);
  }, []);

  const context = useMemo(
    () => ({ onViewSupply: handleViewSupply, onViewProduct: handleViewProduct }),
    [handleViewSupply, handleViewProduct],
  );

  const COMMODITY_COLUMN_DEFS = useMemo<ColDef<CommodityData>[]>(() => [
    {
      headerName: 'Org',
      field: 'ORG',
      flex: 0.6,
      minWidth: 45,
      cellClass: 'flex items-center px-1 text-[9px] text-slate-600 h-full whitespace-nowrap overflow-hidden',
    },
    {
      headerName: 'Src Org',
      field: 'SOURCE_ORG',
      flex: 0.6,
      minWidth: 55,
      cellClass: 'flex items-center px-1 text-[9px] text-slate-600 h-full whitespace-nowrap overflow-hidden',
    },
    {
      headerName: 'TAG',
      field: 'VENDOR_CATEGORY',
      flex: 0.8,
      minWidth: 70,
      cellClass: 'flex items-center px-1 h-full whitespace-nowrap overflow-hidden',
      cellRenderer: (params: any) => {
        if (!params.value) return null;
        const val = String(params.value).toUpperCase();

        let theme = "border-slate-200 bg-slate-50 text-slate-600";
        if (val.includes("T1A")) theme = "border-red-100 bg-red-50 text-red-600";
        if (val.includes("T1B")) theme = "border-amber-100 bg-amber-50 text-amber-600";
        if (val.includes("T2")) theme = "border-blue-100 bg-blue-50 text-blue-600";

        return (
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${val.includes("T1A") ? "bg-red-500" : val.includes("T1B") ? "bg-amber-500" : "bg-blue-400"}`} />
            <span className={`flex justify-center items-center text-[9px] font-black h-4 px-1 py-0.5 rounded border uppercase tracking-tight ${theme}`}>
              {val.replace("TRACK ", "T")}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'COMPONENT',
      field: 'COMPONENT_NO',
      flex: 0.1,
      minWidth: 150,
      // Added standard line height and padding layout to fit multi-line content
      cellClass: 'flex items-center px-2 h-full py-1.5 leading-normal',
      cellRenderer: (params: any) => {
        if (!params.data) return null;

        const code = params.value?.trim();
        const uom = params.data.UOM?.trim() || params.data.uom?.trim() || '-';

        const rawDesc = params.data.DESCRIPTION?.trim() ||
          params.data.description?.trim() ||
          params.data.Description?.trim();

        // Slice strictly to 15 characters
        const truncatedDesc = rawDesc
          ? (rawDesc.length > 15 ? `${rawDesc.slice(0, 20)}...` : rawDesc)
          : null;

        return (
          // Added h-full and justify-center to align items vertically inside the row
          <div className="flex flex-col min-w-0 w-full justify-center h-full">
            {/* Top Row: Code and Badge */}
            <div className="flex items-center gap-1.5 min-w-0 leading-none">
              <span
                className="text-[11px] font-mono font-bold text-violet-700 hover:underline cursor-pointer truncate"
                title={code}
              >
                {code || <span className="text-slate-300">-</span>}
              </span>
              <span className="text-[8px] font-extrabold bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">
                {uom}
              </span>
            </div>

            {/* Bottom Row: Forcing Description to render underneath */}
            <span
              className="text-[10px] font-medium text-slate-500 truncate mt-1 block leading-none"
              title={rawDesc}
            >
              {truncatedDesc || <span className="text-slate-400 font-normal italic">No Description</span>}
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'MONTHLY DEMAND (UNITS)',
      headerClass: 'text-center font-black border-l border-r border-slate-100 text-violet-800 text-[9px] uppercase tracking-wider bg-violet-50/30',
      children: [
        demandCol('UPTO_MONTH_MINUS_TWO', `≤${getRelativeMonthStr(-1)}`, 'projected'),
        demandCol('LAST_MONTH', getRelativeMonthStr(-1), 'current'),
        demandCol('THIS_MONTH', getRelativeMonthStr(0), 'highlight'),
        demandCol('MONTH_PLUS_ONE', getRelativeMonthStr(1), 'projected'),
        demandCol('MONTH_PLUS_TWO_ONWARDS', getRelativeMonthStr(2, true), 'projected'),
      ],
    },
    {
      headerName: "STATUS",
      field: "CONSTRAINT_FLAG",
      flex: 1.2,
      minWidth: 85,
      cellClass: 'px-1.5 h-full flex items-center justify-center whitespace-nowrap overflow-hidden',
      cellRenderer: (params: any) => {
        const isConstrained = params.value === "CONSTRAINT";
        return isConstrained ? (
          <CompactBadge className="border-red-100 bg-red-50 text-red-500 gap-0.5">
            <TriangleAlert size={8} className="fill-red-50" /> Constraint
          </CompactBadge>
        ) : (
          <CompactBadge className="border-emerald-100 bg-emerald-50 text-emerald-600 gap-0.5">
            ✓ OK
          </CompactBadge>
        );
      },
    },
    {
      headerName: 'Custodian',
      field: 'CUSTODIAN_NAME',
      flex: 1.3,
      minWidth: 110,
      cellClass: 'flex items-center text-slate-600 text-left text-[10px] px-2 h-full whitespace-nowrap overflow-hidden',
      valueFormatter: (p) => p.value || '-'
    },
    {
      headerName: 'CMG',
      field: 'CMG_FLAG',
      flex: 0.6,
      minWidth: 50,
      cellClass: 'flex items-center justify-center font-mono text-[10px] text-slate-600 h-full whitespace-nowrap overflow-hidden',
      valueFormatter: (p) => p.value || '-'
    },
    {
      headerName: 'ACTIONS',
      flex: 1,
      minWidth: 110,
      sortable: false,
      filter: false,
      cellClass: 'h-full flex items-center justify-center px-1',
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        const { onViewSupply, onViewProduct } = params.context || {};

        return (
          <div className="flex items-center gap-1 w-full justify-center">
            <button
              onClick={() => onViewSupply?.(params.data)}
              className="flex items-center gap-0.5 text-[9px] font-extrabold h-5 px-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span>Supply</span>
            </button>
            <button
              onClick={() => onViewProduct?.(params.data)}
              className="flex items-center gap-0.5 text-[9px] font-extrabold h-5 px-1.5 rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <span>Product</span>
            </button>
          </div>
        );
      }
    }
  ], []);

  return (
    <div className="w-full antialiased">
      <DataTable<CommodityData>
        rowData={items}
        columnDefs={COMMODITY_COLUMN_DEFS}
        getRowId={(p) => String(p.data.COMPONENT_ITEM_ID)}
        loading={loading}
        context={context}
        emptyMessage="No records found."
      />

      <SupplyModal
        open={modalOpen}
        organizationId={modalItem?.ORGANIZATION_ID ?? null}
        itemNo={modalItem?.COMPONENT_NO ?? null}
        onClose={() => setModalOpen(false)}
      />

      <ProductModal
        open={productModalOpen}
        organizationId={productModalItem?.ORGANIZATION_ID ?? null}
        organization={productModalItem?.ORG ?? null}
        itemNo={productModalItem?.COMPONENT_NO ?? null}
        onClose={() => {
          setProductModalOpen(false);
          setProductModalItem(null);
        }}
      />
    </div>
  );
}
