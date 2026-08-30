import {
  Box,
  Building2,
  CalendarDays,
  ChartColumn,
  ChartNoAxesColumn,
  ChevronRight,
  ClipboardList,
  Clock,
  Cpu,
  FileCheck,
  FileText,
  GitBranch,
  Layers,
  Package,
  Settings,
  ShieldAlert,
  Star,
  Target,
  Truck,
  Upload,
  Users,
} from "lucide-react"

export const LoginPage = () => {
  const currentSystemDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex w-full flex-col items-center justify-center py-12 select-none">
      {/* System Status Sub-Badge */}
      <div className="mb-4 flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/40 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase shadow-sm">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        <span>System Online &middot; {currentSystemDate}</span>
      </div>

      {/* Section Header Text */}
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#004b8d]">
          Planning &amp; Execution System
        </h1>
        <p className="mt-1 text-xs font-bold tracking-widest text-[#4b8cd3] uppercase">
          Janatics
        </p>
      </div>

      {/* Explanatory Prompt */}
      <p className="mb-12 max-w-sm text-center text-xs font-medium tracking-tight text-muted-foreground/70">
        Select your role to access your personalized planning workspace
      </p>

      {/* Grid Layout Canvas */}
      <div className="flex w-100 justify-center gap-4 px-4">
        <div className="flex flex-1 items-start justify-center overflow-hidden px-8 pb-8">
          <div className="flex w-full max-w-[1200px] gap-4">
            <div className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-md">
              <div className="h-1 w-full shrink-0"></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <span className="text-white">
                      <Building2 />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] leading-tight font-black text-slate-800">
                      HO Planner
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Head Office Planning &amp; Sales Orders
                    </div>
                  </div>
                </div>
                <div className="flex max-h-0 flex-col gap-0.5 overflow-hidden opacity-0 transition-all duration-300">
                  <div className="mb-1 h-px bg-slate-100"></div>
                  <button className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700">
                    <span className="shrink-0 text-slate-400 group-hover:text-blue-500">
                      <Layers />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Items Dashboard
                    </span>
                    <ChevronRight />
                  </button>
                  <button className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700">
                    <span className="shrink-0 text-slate-400 group-hover:text-blue-500">
                      <Users />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Customers &amp; Dealers
                    </span>
                    <ChevronRight />
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <FileCheck />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Sales Plan Approval
                    </span>
                    <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-1.5 py-px text-[8px] font-bold text-amber-700">
                      12 pending
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <ChartNoAxesColumn />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      CAP Review
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-md">
              <div className="h-1 w-full shrink-0"></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <span className="text-white">
                      <GitBranch />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] leading-tight font-black text-slate-800">
                      Branch Planner
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Branch-Level Order &amp; Dispatch
                    </div>
                  </div>
                </div>
                <div className="flex max-h-0 flex-col gap-0.5 overflow-hidden opacity-0 transition-all duration-300">
                  <div className="mb-1 h-px bg-slate-100"></div>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <ClipboardList />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Branch Orders
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Truck />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Dispatch Status
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Package />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Local Inventory
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Target />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Branch Targets
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-md">
              <div className="h-1 w-full shrink-0"></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <span className="text-white">
                      <Box />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] leading-tight font-black text-slate-800">
                      Product Custodian
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Item Master &amp; BOM Control
                    </div>
                  </div>
                </div>
                <div className="flex max-h-0 flex-col gap-0.5 overflow-hidden opacity-0 transition-all duration-300">
                  <div className="mb-1 h-px bg-slate-100"></div>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <FileText />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Item Master
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Layers />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      BOM Management
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Settings />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      CAP Configuration
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <ShieldAlert />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Constraint Tracking
                    </span>
                    <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-1.5 py-px text-[8px] font-bold text-amber-700">
                      6 items
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-md">
              <div className="h-1 w-full shrink-0"></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <span className="text-white">
                      <Cpu />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] leading-tight font-black text-slate-800">
                      Commodity Custodian
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Vendor &amp; Component Oversight
                    </div>
                  </div>
                </div>
                <div className="flex max-h-0 flex-col gap-0.5 overflow-hidden opacity-0 transition-all duration-300">
                  <div className="mb-1 h-px bg-slate-100"></div>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Users />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Vendor Management
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Package />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Component Master
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <ChartColumn />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Price Register
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Clock />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Lead Time Setup
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-md">
              <div className="h-1 w-full shrink-0"></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <span className="text-white">
                      <Truck />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] leading-tight font-black text-slate-800">
                      Vendor
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Supplier Portal &amp; PO Compliance
                    </div>
                  </div>
                </div>
                <div className="flex max-h-0 flex-col gap-0.5 overflow-hidden opacity-0 transition-all duration-300">
                  <div className="mb-1 h-px bg-slate-100"></div>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <ClipboardList />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      PO Status
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <CalendarDays />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Delivery Schedule
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Upload />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Invoice Upload
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                  <button className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-slate-300 transition-all">
                    <span className="shrink-0 text-slate-200">
                      <Star />
                    </span>
                    <span className="flex-1 text-[11px] font-semibold">
                      Performance Report
                    </span>
                    <span className="shrink-0 text-[8px] text-slate-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
