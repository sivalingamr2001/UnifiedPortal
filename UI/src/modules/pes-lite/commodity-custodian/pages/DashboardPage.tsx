import { useEffect, useMemo, useCallback } from "react";
import { useState } from "react";
import FilterBar, { type FilterState } from "../components/FilterBar";
import { StatCards } from "../components/StatCards";
import ItemTable from "../components/ItemTable";
import { useCommodity } from "../context/CommodityProvider";

const emptyFilters: FilterState = { orgId: null, tag: "ALL", constrainedOnly: false, search: "" };

export const DashboardPage = () => {
  const { commodities, dashboardMetrics, loading, error, fetchAllCommodities, fetchDashboardMetrics } = useCommodity();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedCustodian, setSelectedCustodian] = useState<string | null>(null);

  const custodians = useMemo(() => {
    return Array.from(
      new Set(
        commodities
          .flatMap((row) => row.CUSTODIAN_NAME?.split(',') || [])
          .map((name) => name.trim())
          .filter((name): name is string => Boolean(name && name.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [commodities]);

  useEffect(() => {
    fetchAllCommodities();
  }, [fetchAllCommodities]);

  useEffect(() => {
    fetchDashboardMetrics(selectedCustodian, filters.orgId);
  }, [fetchDashboardMetrics, selectedCustodian, filters.orgId]);

  const filteredItems = useMemo(() => {
    return commodities.filter((row) => {
      if (selectedCustodian && row.CUSTODIAN_NAME !== selectedCustodian) return false;
      if (filters.orgId != null && row.ORGANIZATION_ID !== filters.orgId) return false;
      if (filters.constrainedOnly && row.CONSTRAINT_FLAG !== "CONSTRAINT") return false;
      if (filters.tag !== "ALL" && String(row.VENDOR_CATEGORY ?? "").toUpperCase() !== filters.tag.toUpperCase()) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!row.COMPONENT_NO?.toLowerCase().includes(q) && !row.DESCRIPTION?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [commodities, filters, selectedCustodian]);

  const handleFilterChange = useCallback((next: FilterState) => setFilters(next), []);

  return (
    <div className="flex w-full flex-col gap-4 p-1.5 bg-slate-50/50 min-h-full">
      <StatCards data={dashboardMetrics} loading={loading} />


      <div className="flex flex-1 min-h-0 w-full flex-col rounded-[6px] border border-slate-100 bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        {error ? (
          <div className="flex w-full items-center justify-center p-4 text-center">
            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">{error}</span>
          </div>
        ) : (
          <div>
            <FilterBar
              tableData={commodities}
              totalRows={filteredItems.length}
              onFilterChange={handleFilterChange}
              custodians={custodians}
              selectedCustodian={selectedCustodian}
              setSelectedCustodian={setSelectedCustodian}
            />
            <ItemTable items={filteredItems} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
};