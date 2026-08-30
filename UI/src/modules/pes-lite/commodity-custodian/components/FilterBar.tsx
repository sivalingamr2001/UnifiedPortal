
import { Building2, ChevronDown, Search, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { CommodityData } from "../api/commodityApi";

export interface FilterState {
  orgId: number | null;
  tag: "ALL" | "Track 1a" | "Track 1b" | "Track 2";
  constrainedOnly: boolean;
  search: string;
}

interface FilterBarProps {
  tableData: CommodityData[];
  totalRows: number;
  onFilterChange: (filters: FilterState) => void;
  custodians: string[]
  selectedCustodian: string | null
  setSelectedCustodian: (name: string | null) => void
}

const TAGS: FilterState["tag"][] = ["ALL", "Track 1a", "Track 1b", "Track 2"] as any;

export default function FilterBar({ tableData, totalRows, onFilterChange, custodians, selectedCustodian,
  setSelectedCustodian }: FilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ orgId: null, tag: "ALL", constrainedOnly: false, search: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedCustodians = useMemo(() => {
    return [...custodians].sort((a, b) => a.localeCompare(b))
  }, [custodians])

  const orgOptions = useMemo(() => {
    const uniqueMap = new Map<number, string>();
    tableData.forEach((row) => {
      if (row.ORGANIZATION_ID != null && row.ORG) uniqueMap.set(row.ORGANIZATION_ID, row.ORG.trim());
    });
    const sorted = Array.from(uniqueMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    return [{ id: null as number | null, label: "All Orgs" }, ...sorted];
  }, [tableData]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange(next);
  };

  const selectedOrgLabel = orgOptions.find((o) => o.id === filters.orgId)?.label ?? "All Orgs";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-[6px] shrink-0 flex-wrap shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)] select-none">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 rounded-[6px] px-2.5 py-1 bg-white hover:border-violet-400 transition-colors min-w-[130px] text-slate-700"
        >
          <Building2 size={12} className="text-violet-500 shrink-0" />
          <span className="truncate">{selectedOrgLabel}</span>
          <ChevronDown size={11} className="ml-auto text-slate-400 shrink-0" />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-100 shadow-lg rounded-[6px] py-1 z-30 text-xs max-h-56 overflow-y-auto">
            {orgOptions.map((org) => (
              <button
                key={org.id ?? "all"}
                type="button"
                onClick={() => { update({ orgId: org.id }); setDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 font-medium hover:bg-slate-50 block ${filters.orgId === org.id ? "text-violet-600 bg-violet-50/50 font-bold" : "text-slate-600"
                  }`}
              >
                {org.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200" />

      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => update({ tag })}
          className={`text-xs font-bold px-2.5 py-1 rounded-[6px] border transition-all ${filters.tag === tag ? "bg-slate-700 text-white border-slate-700" : "text-slate-500 border-slate-200 hover:border-slate-400 bg-white"
            }`}
        >
          {tag === "ALL" ? "All Tags" : tag}
        </button>
      ))}

      <button
        onClick={() => update({ constrainedOnly: !filters.constrainedOnly })}
        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-[6px] border transition-all ${filters.constrainedOnly ? "text-white bg-red-500 border-red-500" : "text-red-500 border-red-200 bg-red-50 hover:border-red-400"
          }`}
      >
        <ShieldAlert size={11} />
        Constraint
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="mr-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Custodian
        </span>
        <Select
          value={selectedCustodian || "ALL"}
          onValueChange={(val) => {
            setSelectedCustodian(val === "ALL" ? null : val)
          }}
        >
          <SelectTrigger className="h-7 w-[150px] rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-500 shadow-none focus:ring-0 focus:ring-offset-0 focus:border-blue-400">
            <SelectValue placeholder="All Custodians" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="ALL" className="text-[11px]">All Custodians</SelectItem>
            {sortedCustodians.map((name) => (
              <SelectItem key={name} value={name} className="text-[11px]">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Search size={12} className="text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Code / desc…"
          className="text-xs border border-slate-200 rounded-[6px] px-2.5 py-1 w-32 focus:outline-none focus:border-violet-400 bg-slate-50"
        />
      </div>

      <span className="text-xs text-slate-400 font-semibold shrink-0 pl-1">{totalRows.toLocaleString()} items</span>
    </div>
  );
}
