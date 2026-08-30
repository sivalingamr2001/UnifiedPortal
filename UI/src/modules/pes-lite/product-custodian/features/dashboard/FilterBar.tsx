import { Button } from "@/shared/components/ui/button"
import { Search } from "lucide-react"
import type { FilterConstraint, FilterType } from "./types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useMemo } from "react"

export type FilterFocus = "all" | "key"

interface Props {
  search: string
  setSearch: (v: string) => void
  type: FilterType
  setType: (v: FilterType) => void
  constraint: FilterConstraint
  setConstraint: (v: FilterConstraint) => void
  count: number
  total: number
  orgs: Array<{ ORG: string; ORGANIZATION_ID: number }>
  selectedOrgId: number | string
  setSelectedOrgId: (id: number | string) => void
  custodians: string[]
  selectedCustodian: string | null
  setSelectedCustodian: (name: string | null) => void
  level5Values: string[]
  selectedLevel5: string | null
  setSelectedLevel5: (name: string | null) => void
}

export const FilterBar = ({
  search,
  setSearch,
  type,
  setType,
  constraint,
  setConstraint,
  count,
  total,
  orgs,
  selectedOrgId,
  setSelectedOrgId,
  custodians,
  selectedCustodian,
  setSelectedCustodian,
  level5Values,
  selectedLevel5,
  setSelectedLevel5,
}: Props) => {

  // Sort Organizations alphabetically (A-Z) by name
  const sortedOrgs = useMemo(() => {
    return [...orgs].sort((a, b) => a.ORG.localeCompare(b.ORG))
  }, [orgs])

  // Sort Custodians alphabetically (A-Z) by name
  const sortedCustodians = useMemo(() => {
    return [...custodians].sort((a, b) => a.localeCompare(b))
  }, [custodians])

  const typeBtn = (label: FilterType, text: string) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setType(label)}
      className={`h-6 rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap shadow-none ${type === label
        ? "border-violet-600 bg-violet-600 text-white hover:bg-violet-700 hover:text-white"
        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
        }`}
    >
      {text}
    </Button>
  )

  const conBtn = (label: FilterConstraint, text: string) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setConstraint(label)}
      className={`h-6 rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap shadow-none ${constraint === label
        ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
        }`}
    >
      {text}
    </Button>
  )

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-t-[8px] border-b border-slate-100 bg-white px-4 py-2 flex-wrap md:flex-nowrap">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 w-48 rounded-full border border-slate-200 bg-white pr-3 pl-7 text-[11px] transition-all placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        />
      </div>

      <div className="mx-0.5 h-4 w-px bg-slate-200 hidden md:block"></div>

      <span className="mr-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        Type
      </span>
      {typeBtn("ALL", "All AMS")}
      {typeBtn("AMS1", "AMS1")}
      {typeBtn("AMS2", "AMS2")}

      <div className="mx-0.5 h-4 w-px bg-slate-200"></div>

      <span className="mr-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        Constraint
      </span>
      {conBtn("ALL", "All")}
      {conBtn("CONSTRAINT", "Constraint")}
      {conBtn("UNCONSTRAINT", "Unconstraint")}

      <div className="mx-0.5 h-4 w-px bg-slate-200"></div>

      {/* Shadcn Org Dropdown Filter */}
      <span className="mr-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        Org
      </span>
      <Select
        value={String(selectedOrgId || "ALL")}
        onValueChange={(val) => {
          setSelectedOrgId(val === "ALL" ? "ALL" : Number(val))
        }}
      >
        <SelectTrigger className="h-7 w-[130px] rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-500 shadow-none focus:ring-0 focus:ring-offset-0 focus:border-blue-400">
          <SelectValue>
            {/* Forces the trigger to visually display the text code "I21" instead of the bound primitive number "504" */}
            {selectedOrgId === "ALL"
              ? "All Orgs"
              : sortedOrgs.find(o => o.ORGANIZATION_ID === Number(selectedOrgId))?.ORG || String(selectedOrgId)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="ALL" className="text-[11px]">All Orgs</SelectItem>
          {sortedOrgs.map((org) => (
            <SelectItem key={org.ORGANIZATION_ID} value={String(org.ORGANIZATION_ID)} className="text-[11px]">
              {org.ORG}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mx-0.5 h-4 w-px bg-slate-200"></div>

      {/* Shadcn Custodian Dropdown Filter */}
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

      <div className="mx-0.5 h-4 w-px bg-slate-200"></div>

      <span className="mr-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        L5
      </span>
      <Select
        value={selectedLevel5 || "ALL"}
        onValueChange={(val) => {
          setSelectedLevel5(val === "ALL" ? null : val)
        }}
      >
        <SelectTrigger className="h-7 w-[140px] rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-500 shadow-none focus:ring-0 focus:ring-offset-0 focus:border-blue-400">
          <SelectValue placeholder="All Level 5" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="ALL" className="text-[11px]">All Level 5</SelectItem>
          {level5Values.map((level5) => (
            <SelectItem key={level5} value={level5} className="text-[11px]">
              {level5}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto font-mono text-[11px] tracking-tight text-slate-400 whitespace-nowrap">
        {count}/{total} items
      </div>
    </div>
  )
}
