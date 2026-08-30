import { pesApi, type PesComponentDetails, type PesConsolidatedData, type PesItemDetailedRow } from "../api/pesApi"
import { Loader } from "@/shared/components/Loader"
import { usePes } from "../context/PesProvider"
import { FilterBar } from "../features/dashboard/FilterBar"
import { ItemDetails } from "../features/dashboard/ItemDetails"
import { ItemTable } from "../features/dashboard/ItemTable"
import { StatCards } from "../features/dashboard/StatCards"
import type { FilterConstraint, FilterType } from "../features/dashboard/types"
import { useEffect, useMemo, useState } from "react"
import { Footer } from "react-day-picker"

export const DashboardPage = () => {
  const { data: items, loading, error, refreshData, reFetchDashboard } = usePes()

  const [search, setSearch] = useState<string>("")
  const [type, setType] = useState<FilterType>("ALL")
  const [constraint, setConstraint] = useState<FilterConstraint>("ALL")
  const [activeTab] = useState<string>("items")
  const [selectedItem, setSelectedItem] = useState<PesConsolidatedData | null>(null)
  const [selectedItemDetails, setSelectedItemDetails] = useState<PesItemDetailedRow[]>([])
  const [selectedComponentDetails, setSelectedComponentDetails] = useState<PesComponentDetails[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Filtering States
  const [selectedCustodian, setSelectedCustodian] = useState<string | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<number | string>("ALL")
  const [selectedLevel5, setSelectedLevel5] = useState<string | null>(null)

  // Extract unique structural pairs for organization selection dropdown
  const uniqueOrgData = useMemo(() => {
    if (!items || !Array.isArray(items)) return []
    const uniquePairs = new Set(
      items.map(item => JSON.stringify({
        ORG: item.ORG,
        ORGANIZATION_ID: item.ORGANIZATION_ID
      }))
    )
    return Array.from(uniquePairs).map(
      str => JSON.parse(str) as { ORG: string; ORGANIZATION_ID: number }
    )
  }, [items])

  const uniqueCustodians = useMemo(() => {
    if (!items || !Array.isArray(items)) return []

    const allIndividualNames = new Set<string>()

    items.forEach(item => {
      if (typeof item.CUSTODIAN_NAME === 'string' && item.CUSTODIAN_NAME.trim() !== '') {
        const namesArray = item.CUSTODIAN_NAME.split(',')

        namesArray.forEach(name => {
          const cleanedName = name.trim()
          if (cleanedName && cleanedName !== '—' && cleanedName !== '-') {
            allIndividualNames.add(cleanedName)
          }
        })
      }
    })

    return Array.from(allIndividualNames).sort()
  }, [items])

  const uniqueLevel5s = useMemo(() => {
    if (!items || !Array.isArray(items)) return []

    const allLevel5 = new Set<string>()

    items.forEach(item => {
      const level5 = item.LEVEL_5?.trim()
      if (level5) {
        allLevel5.add(level5)
      }
    })

    return Array.from(allLevel5).sort()
  }, [items])

  useEffect(() => {
    if (activeTab === "items" && items.length === 0) {
      refreshData()
    }
  }, [activeTab, items.length, refreshData])

  // Triggers API data updates when EITHER parameter changes
  useEffect(() => {
    const orgParam = selectedOrgId === "ALL" ? "" : String(selectedOrgId)
    const custodianParam = selectedCustodian ?? ""
    const level5Param = selectedLevel5 ?? ""

    void reFetchDashboard(custodianParam, orgParam, level5Param)
    void refreshData(custodianParam, orgParam, level5Param)
  }, [refreshData, reFetchDashboard, selectedCustodian, selectedOrgId, selectedLevel5])

  useEffect(() => {
    if (!selectedItem) {
      setSelectedItemDetails([])
      setSelectedComponentDetails([])
      setDetailsError(null)
      setDetailsLoading(false)
      return
    }

    let cancelled = false
    const loadDetails = async () => {
      setDetailsLoading(true)
      setDetailsError(null)
      try {
        const [itemDetailsResponse] = await Promise.all([
          pesApi.getItemDetails(selectedItem.INVENTORY_ITEM_ID),
        ])
        if (!cancelled) {
          setSelectedItemDetails(itemDetailsResponse.data ?? [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setSelectedItemDetails([])
          setSelectedComponentDetails([])
          setDetailsError(loadError instanceof Error ? loadError.message : "Unable to load item details")
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false)
        }
      }
    }
    loadDetails()
    return () => { cancelled = true }
  }, [selectedItem])

  const filtered = useMemo(() => {
    if (!items || !Array.isArray(items)) return []

    return items.filter((item: PesConsolidatedData) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesItemCode = item.ORDERED_ITEM?.toLowerCase().includes(searchLower)
        const matchesCategory = item.AMS_CAT?.toLowerCase().includes(searchLower)
        const matchesOrg = item.ORG?.toLowerCase().includes(searchLower)
        if (!matchesItemCode && !matchesCategory && !matchesOrg) return false
      }

      if (type !== "ALL" && item.AMS_CAT !== type) return false
      if (constraint === "CONSTRAINT" && item.CONSTRAINT !== "CONSTRAINT") return false
      if (constraint === "UNCONSTRAINT" && item.CONSTRAINT === "CONSTRAINT") return false

      // Matches the row if its full database name contains the selected dropdown filter name
      if (selectedCustodian && !item.CUSTODIAN_NAME?.split(',')[0].trim().includes(selectedCustodian)) return false
      if (selectedOrgId !== "ALL" && String(item.ORGANIZATION_ID) !== String(selectedOrgId)) return false
      if (selectedLevel5 && item.LEVEL_5?.trim() !== selectedLevel5) return false

      return true
    })
  }, [items, search, type, constraint, selectedCustodian, selectedOrgId, selectedLevel5])

  const handleBack = () => {
    refreshData()
    setSelectedItem(null)
  }

  if (loading && items.length === 0) {
    return <Loader isText={true} />
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-500 font-semibold">Database Error: {error}</p>
        <button onClick={() => void refreshData()} className="rounded-lg bg-primary px-4 py-2 text-white shadow-sm hover:opacity-90">
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <StatCards
        custodianName={selectedCustodian ?? ""}
        orgId={selectedOrgId === "ALL" ? "" : String(selectedOrgId)}
      />
      <div className="shrink-0 overflow-hidden px-4 pb-2 pt-1">
        {activeTab === "items" && !selectedItem && (
          <>
            <FilterBar
              search={search}
              setSearch={setSearch}
              type={type}
              setType={setType}
              constraint={constraint}
              setConstraint={setConstraint}
              count={filtered.length}
              total={items.length}
              custodians={uniqueCustodians}
              selectedCustodian={selectedCustodian}
              setSelectedCustodian={setSelectedCustodian}
              orgs={uniqueOrgData}
              selectedOrgId={selectedOrgId}
              setSelectedOrgId={setSelectedOrgId}
              level5Values={uniqueLevel5s}
              selectedLevel5={selectedLevel5}
              setSelectedLevel5={setSelectedLevel5}
            />
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {/* Table items data elements preserve original structural dual names */}
              <ItemTable items={filtered} onRowClick={setSelectedItem} onFilterChange={setSelectedCustodian} loading={loading} />
            </div>
          </>
        )}

        {activeTab === "items" && selectedItem && (
          <div className="flex h-[calc(100vh-250px)] flex-col overflow-hidden rounded-b-[10px] border border-slate-100 bg-white shadow-[0_12px_24px_-4px_rgba(0,0,0,0.02)]">
            <ItemDetails
              item={selectedItem}
              itemDetails={selectedItemDetails}
              componentDetails={selectedComponentDetails}
              loading={detailsLoading}
              error={detailsError}
              onBack={() => handleBack()}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
