import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Filter,
  Download,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Circle,
  Info,
  Route,
  Truck,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { queryApi } from "../../api/endpoints";

type StageStatus = "on-track" | "at-risk" | "delayed" | "not-started";

type StageBlock = {
  name: string;
  queue?: string;
  toMove?: string;
  scrap?: string;
  status: StageStatus;
  warning?: boolean;
  vendorName: string;
};

type JourneyItem = {
  id: number;
  item: string;
  location: string;
  totalOSPs: number;
  planTAT: number;
  actualTAT: number;
  variance: number;
  status: "On Track" | "At Risk" | "Delayed";
  altRoute?: boolean;
  jobs?: number;
  delayedJobs?: number;
  stages: StageBlock[];
  jobId?: string;
  jobVariance?: number;
  jobCards?: JourneyItem[];
  jobDate?: string;
  Description?: string;
  qtyToStore: number;
};

type ApiRecord = Record<string, unknown>;

const queryNumber = Number(
  import.meta.env.VITE_PES_CONTROL_TOWER_QUERY_NUMBER ?? "1"
);

function valueOf(record: ApiRecord, ...keys: string[]): unknown {
  const entry = Object.entries(record).find(([key]) =>
    keys.some((candidate) => key.toLowerCase() === candidate.toLowerCase())
  );
  return entry?.[1];
}

function textOf(record: ApiRecord, ...keys: string[]): string {
  const value = valueOf(record, ...keys);
  return value == null ? "" : String(value);
}

function numberOf(record: ApiRecord, ...keys: string[]): number {
  const value = Number(valueOf(record, ...keys));
  return Number.isFinite(value) ? value : 0;
}

function booleanOf(record: ApiRecord, ...keys: string[]): boolean {
  const value = valueOf(record, ...keys);
  return value === true || value === 1 || String(value).toLowerCase() === "true";
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDisplayDate(value?: string): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function parseStages(record: ApiRecord): StageBlock[] {
  const rawStages = valueOf(record, "stages", "stageData", "ospStages");
  let stages: unknown[] = Array.isArray(rawStages) ? rawStages : [];
  if (typeof rawStages === "string") {
    try {
      const parsed = JSON.parse(rawStages);
      stages = Array.isArray(parsed) ? parsed : [];
    } catch {
      stages = [];
    }
  }

  if (stages.length === 0) {
    for (let index = 1; index <= 6; index += 1) {
      const name = textOf(record, `OPN${index}_OPERATION_DESC`);
      if (!name) continue;
      const started = textOf(record, `OPN${index}_PROCESS_START_DATE`);
      const completed = textOf(record, `OPN${index}_PROCESS_COMPLETION_DATE`);
      const leadDays = numberOf(record, `OPN${index}_LEAD_TIME`);
      const startDate = parseDate(started);
      const completionDate = parseDate(completed);
      const plannedDate = startDate ? addDays(startDate, leadDays) : null;
      let status: StageStatus = "not-started";

      if (startDate) {
        if (completionDate && plannedDate && plannedDate <= completionDate) {
          status = "on-track";
        } else if (plannedDate && plannedDate < new Date()) {
          status = "delayed";
        } else {
          status = "at-risk";
        }
      }

      stages.push({
        name,
        queue: textOf(record, `OPN${index}_QTY_QUEUE`) || undefined,
        toMove: textOf(record, `OPN${index}_QTY_MOVE`) || undefined,
        scrap: textOf(record, `OPN${index}_QTY_SCRAP`) || undefined,
        status,
        warning: Boolean(startDate && !completionDate),
        vendorName: textOf(record, `OPN${index}_VENDOR_NAME`) || "In House",
        qtyToStore: textOf(record, `QTY_TOSTORE`) || "",
      });
    }
  }

  return stages.map((stage, index) => {
    const data = (stage ?? {}) as ApiRecord;
    const status = textOf(data, "status", "stageStatus").toLowerCase();
    return {
      name: textOf(data, "name", "stageName", "ospName") || `OSP ${index + 1}`,
      queue: textOf(data, "queue", "pending", "queued") || undefined,
      toMove: textOf(data, "toMove", "toMoveCount") || undefined,
      scrap: textOf(data, "scrap", "scrapped", "scrapCount") || undefined,
      status: status.includes("delay")
        ? "delayed"
        : status.includes("risk")
          ? "at-risk"
          : status.includes("start")
            ? "not-started"
            : "on-track",
      warning: booleanOf(data, "warning", "hasWarning"),
      vendorName: textOf(data, "vendorName") || "In House",
      qtyToStore: textOf(data, "qtyToStore") || "",
    };
  });
}

function sumStageValue(jobCards: JourneyItem[], stageIndex: number, key: keyof Pick<StageBlock, "queue" | "toMove" | "scrap">): string | undefined {
  const values = jobCards
    .map((jobCard) => jobCard.stages[stageIndex]?.[key])
    .filter((value): value is string => value != null && value.trim() !== "");

  if (values.length === 0) return undefined;

  const total = values.reduce((sum, value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);

  return String(total);
}

function aggregateStages(jobCards: JourneyItem[]): StageBlock[] {
  const stageCount = Math.max(...jobCards.map((jobCard) => jobCard.stages.length), 0);

  return Array.from({ length: stageCount }, (_, stageIndex) => {
    const stages = jobCards
      .map((jobCard) => jobCard.stages[stageIndex])
      .filter((stage): stage is StageBlock => stage != null);
    const status = stages.some((stage) => stage.status === "delayed")
      ? "delayed"
      : stages.some((stage) => stage.status === "at-risk")
        ? "at-risk"
        : stages.every((stage) => stage.status === "not-started")
          ? "not-started"
          : "on-track";

    return {
      name: stages[0]?.name ?? `OSP ${stageIndex + 1}`,
      queue: sumStageValue(jobCards, stageIndex, "queue"),
      toMove: sumStageValue(jobCards, stageIndex, "toMove"),
      scrap: sumStageValue(jobCards, stageIndex, "scrap"),
      status,
      warning: stages.some((stage) => stage.warning),
      vendorName: stages[0]?.vendorName ?? "In House",
    };
  });
}

function normalizeRows(data: unknown): JourneyItem[] {
  const rows = Array.isArray(data) ? data : [];
  const jobRows = rows.flatMap((value, index) => {
    if (!value || typeof value !== "object") return [];
    const record = value as ApiRecord;
    const stages = parseStages(record);
    const status = textOf(record, "status", "overallStatus").toLowerCase();
    const jobDate = textOf(record, "jobDate", "JOB_DT", "jobDt") || undefined;
    const jobDateValue = parseDate(jobDate);
    const jobAgeDays = jobDateValue ? daysBetween(jobDateValue, new Date()) : 0;
    const delayedStage = stages.some((stage) => stage.status === "delayed");
    const atRiskStage = stages.some((stage) => stage.status === "at-risk");
    const atRiskByAge = jobAgeDays > 60;
    const derivedStatus = status || (delayedStage ? "delayed" : atRiskByAge ? "at-risk" : atRiskStage ? "at-risk" : "on-track");
    const totalOSPs = stages.length || numberOf(record, "totalOSPs", "ospCount", "totalOsp");
    const planTAT = numberOf(record, "planTAT", "plannedTat", "plannedTAT") || stages.reduce((total, stage) => total + Number(stage.scrap ?? 0), 0);
    const itemNumber = textOf(record, "item", "itemName", "product", "productName", "itemNo", "ITEM_NO") || "Unnamed item";
    const description = textOf(record, "description", "DESCRIPTION", "itemDescription", "prodDescription") || undefined;
    const jobNumber = textOf(record, "jobId", "jobNumber", "jobNo", "JOB_NO") || undefined;
    const normalizedStatus: JourneyItem["status"] = derivedStatus.includes("delay")
      ? "Delayed"
      : derivedStatus.includes("risk")
        ? "At Risk"
        : "On Track";
    return [{
      id: numberOf(record, "id", "itemId", "jobId") || index + 1,
      item: itemNumber,
      location: textOf(record, "location", "plant", "customerLocation", "organizationId", "organization_id", "ORGANIZATION_ID"),
      totalOSPs,
      planTAT,
      actualTAT: numberOf(record, "actualTAT", "actualTat"),
      variance: numberOf(record, "variance", "tatVariance"),
      status: normalizedStatus,
      altRoute: Boolean(textOf(record, "altRoute", "alternateRoute", "alternateRoutingDesignator", "ALTERNATE_ROUTING_DESIGNATOR")),
      jobs: 1,
      delayedJobs: numberOf(record, "delayedJobs", "delayedJobCount"),
      jobId: jobNumber,
      jobVariance: numberOf(record, "jobVariance"),
      jobDate,
      Description: description,
      qtyToStore: numberOf(record, "qtyToStore", "QTY_TOSTORE"),
      stages,
    }];
  });

  const grouped = new Map<string, JourneyItem[]>();
  for (const job of jobRows) {
    const key = `${job.item}|${job.location}`;
    const existing = grouped.get(key) ?? [];
    existing.push(job);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((jobCards, index) => {
    const firstJob = jobCards[0];
    const status = jobCards.some((job) => job.status === "Delayed")
      ? "Delayed"
      : jobCards.some((job) => job.status === "At Risk")
        ? "At Risk"
        : "On Track";

    return {
      ...firstJob,
      id: index + 1,
      stages: aggregateStages(jobCards),
      status,
      totalOSPs: Math.max(...jobCards.map((job) => job.totalOSPs)),
      planTAT: Math.max(...jobCards.map((job) => job.planTAT)),
      actualTAT: Math.max(...jobCards.map((job) => job.actualTAT)),
      variance: Math.max(...jobCards.map((job) => job.variance)),
      jobs: jobCards.length,
      delayedJobs: jobCards.filter((job) => job.status === "Delayed").length,
      jobId: undefined,
      jobVariance: undefined,
      jobCards,
    };
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "On Track":
      return "bg-green-100 text-green-700";
    case "At Risk":
      return "bg-amber-100 text-amber-700";
    case "Delayed":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function stageRing(status: StageStatus) {
  switch (status) {
    case "on-track":
      return "ring-green-400";
    case "at-risk":
      return "ring-amber-400";
    case "delayed":
      return "ring-red-400";
    default:
      return "ring-gray-200";
  }
}

function stageCellBg(status: StageStatus) {
  switch (status) {
    case "on-track":
      return "bg-green-50 border-green-300";
    case "at-risk":
      return "bg-amber-50 border-amber-300";
    case "delayed":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

export default function PlanningExecutionControlTower() {
  const [journeyData, setJourneyData] = useState<JourneyItem[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expand, setExpand] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    if (!Number.isInteger(queryNumber) || queryNumber <= 0) {
      setError("Set VITE_PES_CONTROL_TOWER_QUERY_NUMBER to a valid query number.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await queryApi.execute({ QueryNumber: queryNumber });
      const groupedRows = normalizeRows(response.Data ?? response.data ?? []);
      const sortedRows = groupedRows.sort((a, b) => a.item.localeCompare(b.item));
      setJourneyData(sortedRows);
      console.log(sortedRows);
      setExpandedRow(null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load control tower data."
      );
    } finally {
      setIsLoading(false);
    }
  };




  useEffect(() => {
    const loadTimer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const filteredJourneyData = React.useMemo(() => {
    if (!searchQuery.trim()) return journeyData;
    const q = searchQuery.toLowerCase();
    return journeyData.filter((row) => {
      return (
        row.item?.toLowerCase().includes(q) ||
        row.location?.toLowerCase().includes(q) ||
        row.jobId?.toLowerCase().includes(q) ||
        row.status?.toLowerCase().includes(q) ||
        row.stages?.some(
          (stage) =>
            stage.name?.toLowerCase().includes(q) ||
            stage.vendorName?.toLowerCase().includes(q)
        )
      );
    });
  }, [journeyData, searchQuery]);

  const totalJobs = filteredJourneyData.reduce((total, row) => total + (row.jobs ?? 1), 0);
  const onTrack = filteredJourneyData.filter((row) => row.status === "On Track").reduce((total, row) => total + (row.jobs ?? 1), 0);
  const atRisk = filteredJourneyData.filter((row) => row.status === "At Risk").reduce((total, row) => total + (row.jobs ?? 1), 0);
  const delayed = filteredJourneyData.filter((row) => row.status === "Delayed").reduce((total, row) => total + (row.jobs ?? 1), 0);
  const average = (selector: (row: JourneyItem) => number) =>
    filteredJourneyData.length === 0 ? 0 : filteredJourneyData.reduce((total, row) => total + selector(row), 0) / filteredJourneyData.length;
  const percentage = (value: number) => totalJobs === 0 ? "0%" : `${Math.round((value / totalJobs) * 100)}%`;
  const statusData = [
    { name: "On Track", value: onTrack, color: "#16a34a" },
    { name: "At Risk", value: atRisk, color: "#d97706" },
    { name: "Delayed", value: delayed, color: "#dc2626" },
  ];
  const varianceData = [
    { stage: "Pre-Processing", value: average((row) => row.stages.reduce((sum, stage) => sum + Number.parseFloat(stage.queue ?? "0"), 0)), color: "#fca5a5" },
    { stage: "Processing", value: average((row) => row.stages.reduce((sum, stage) => sum + Number.parseFloat(stage.toMove ?? "0"), 0)), color: "#ef4444" },
    { stage: "Post-Processing", value: average((row) => row.stages.reduce((sum, stage) => sum + Number.parseFloat(stage.scrap ?? "0"), 0)), color: "#4ade80" },
  ];
  const delayedOSPs = filteredJourneyData.flatMap((row) => row.stages
    .filter((stage) => stage.status === "delayed" || stage.status === "at-risk")
    .map((stage) => ({ name: stage.name, value: Math.abs(row.variance) })))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-sm">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0f1b2d] px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[13px] font-bold text-white tracking-wide uppercase leading-tight">
              Planning & Execution Control Tower
            </h1>
            <p className="text-[11px] text-blue-300/70 mt-0.5">
              Jobs Card Train Journey
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, status, location..."
                className="w-64 bg-slate-800/80 border border-slate-700/80 text-white rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Loading control tower data...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button className="inline-flex items-center gap-1.5 font-semibold hover:text-red-900" onClick={() => void loadData()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}
          {!isLoading && !error && journeyData.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
              No control tower records were returned by the query.
            </div>
          )}

          {/* KPI cards */}
          <div className="flex gap-2 flex-wrap">
            <KpiCard
              label="Total Job Card"
              value={totalJobs}
              sub="Across all stages"
              icon={<LayoutGrid className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <KpiCard
              label="On Track"
              value={onTrack}
              sub={percentage(onTrack)}
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-50"
              subClass="text-green-600"
            />
            <KpiCard
              label="At Risk"
              value={atRisk}
              sub={percentage(atRisk)}
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
              iconBg="bg-amber-50"
              subClass="text-amber-600"
            />
            <KpiCard
              label="Delayed"
              value={delayed}
              sub={percentage(delayed)}
              icon={<CircleAlert className="w-4 h-4 text-red-600" />}
              iconBg="bg-red-50"
              subClass="text-red-600"
            />
            {/* <KpiCard
              label="Avg Plan TAT"
              value={average((row) => row.planTAT).toFixed(1)}
              sub="Days"
              icon={<Clock3 className="w-4 h-4 text-slate-500" />}
              iconBg="bg-slate-100"
            />
            <KpiCard
              label="Avg Actual TAT"
              value={average((row) => row.actualTAT).toFixed(1)}
              sub="Days"
              icon={<CalendarDays className="w-4 h-4 text-slate-500" />}
              iconBg="bg-slate-100"
            />
            <KpiCard
              label="Avg Variance"
              value={`+${average((row) => row.variance).toFixed(1)}`}
              sub="Days"
              icon={<BarChart3 className="w-4 h-4 text-red-500" />}
              iconBg="bg-red-50"
              subClass="text-red-500"
            /> */}
            <KpiCard
              label="On-time Completion"
              value={percentage(onTrack)}
              sub="Current query"
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-50"
              subClass="text-green-600"
            />
          </div>

          {/* Journey table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-gray-800 tracking-wide uppercase">
                  Job Card Train Journey – All Items
                </span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <LegendDot color="bg-green-500" label="On Track" />
                  <LegendDot color="bg-amber-500" label="At Risk" />
                  <LegendDot color="bg-red-500" label="Delayed" />
                  <LegendDot color="bg-gray-300" label="Not Started" />
                </div>

                <div className="flex items-center gap-1 text-[10px] text-purple-600 border border-purple-200 bg-purple-50 rounded px-2 py-0.5">
                  <Route className="w-3 h-3" />
                  <span className="font-semibold">Alt. Route Available</span>
                </div>
              </div>
            </div>

            {/* Table header */}
            <div className="flex items-center bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2">
              <div className="w-6 shrink-0"></div>
              <div className="w-36 shrink-0 py-2 px-2">Item</div>
              <div className="w-24 shrink-0 text-center py-2">No Of JOBS</div>
              <div className="w-24 shrink-0 text-center py-2">St Dlyd Pend</div>

              <div className="w-24 shrink-0 text-center py-2">Status</div>
              <div className="flex-1 py-2 px-2 flex gap-4 text-center">
                <span className="flex-1">Operation Work Station</span>
              </div>
            </div>

            {filteredJourneyData.map((row) => (
              <div key={row.id} className="border-b border-gray-100 last:border-b-0">
                <div
                  className={`flex items-center px-2 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 ${expandedRow === row.id ? "bg-blue-50/30" : ""
                    }`}
                  onClick={() => toggleRow(row.id)}
                >
                  <div className="w-6 shrink-0 flex justify-center text-gray-400 hover:text-blue-500">
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${expandedRow === row.id ? "rotate-90" : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(row.id)
                        setExpand((prev) => !prev);
                      }}
                    />
                  </div>

                  <div className="w-36 shrink-0 px-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-gray-800 leading-tight">
                        {row.item}
                      </span>
                      {row.Description && (
                        <span className="text-[9px] text-gray-500 leading-tight">
                          {row.Description}
                        </span>
                      )}
                    </div>
                    {/* <div className="flex items-center gap-1 flex-wrap mt-1">
                      <span className="text-[9px] text-gray-400">{row.location}</span>
                      {row.altRoute && (
                        <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded px-1 py-[1px] text-[8px] font-semibold">
                          <Route className="w-3 h-3" />
                          Alt. Route
                        </span>
                      )}
                    </div> */}
                  </div>

                  <div className="w-24 shrink-0 text-center font-mono text-[12px] font-semibold text-gray-700">
                    {row.jobs}
                  </div>
                  <div className="w-24 shrink-0 text-center font-mono text-[12px] font-semibold text-gray-700">
                    <span className={`px-2 py-0.5 rounded text-[12px] font-semibold ${row.qtyToStore === 0 ? "" : "bg-green-100 text-green-700"}`}>
                      {row.qtyToStore === 0 ? "" : row.qtyToStore}
                    </span>
                  </div>
                  <div className="w-24 shrink-0 flex items-center justify-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                    {row.status === "Delayed" && <CircleAlert className="w-3.5 h-3.5 text-red-500" />}
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <div className="flex items-center gap-1">
                      {row.stages.map((stage, idx) => {
                        const isEmpty = stage.status === "not-started";
                        return (
                          <div key={idx} className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <ChevronRight className="w-3 h-3 text-blue-400" />
                            </div>

                            <div
                              className={`flex w-fit min-w-[120px] max-w-[220px] flex-col items-stretch rounded ${isEmpty ? "ring-1 ring-gray-200" : `ring-1 ${stageRing(stage.status)}`
                                } bg-white overflow-hidden`}
                            >
                              <div className="flex w-full divide-x divide-gray-100">
                                {["queue", "toMove", "scrap"].map((part) => {
                                  const value =
                                    part === "queue"
                                      ? stage.queue
                                      : part === "toMove"
                                        ? stage.toMove
                                        : stage.scrap;

                                  const bgClass = isEmpty
                                    ? "bg-gray-50 border-gray-200"
                                    : stageCellBg(stage.status);

                                  return (
                                    <div
                                      key={part}
                                      className={`flex min-w-[58px] flex-col items-center px-1.5 py-1 border ${bgClass}`}
                                    >
                                      <span className="text-[8px] font-semibold text-gray-400 leading-none uppercase tracking-wide">
                                        {part}
                                      </span>
                                      <span className="text-[10px] font-semibold text-gray-700 font-mono leading-tight my-[3px]">
                                        {value ?? "-"}
                                      </span>
                                      {!isEmpty ? (
                                        stage.warning ? (
                                          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500 text-white text-[5px] font-bold">
                                            !
                                          </span>
                                        ) : (
                                          <CircleCheckBig className="w-2 h-2 text-green-500" />
                                        )
                                      ) : (
                                        <Circle className="w-2 h-2 text-gray-300" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="w-full bg-gray-100 border-t border-gray-100 px-1 py-[2px] text-center text-[10px] font-medium text-gray-400 tracking-wide break-words leading-snug">
                                {stage.name}
                              </div>
                              <div className="w-full bg-gray-100 border-t border-gray-100 px-1 py-[2px] text-center text-[10px] font-medium text-gray-400 tracking-wide break-words leading-snug">
                                {stage.vendorName ?? stage.name}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {expand && expandedRow === row.id && (
                  <div className="border-t border-blue-100">
                    {(row.jobCards ?? [row]).map((jobCard) => (
                      <div key={jobCard.jobId ?? jobCard.id} className="flex items-center pl-10 pr-2 py-1.5 bg-slate-50 border-t border-dashed border-gray-200 hover:bg-blue-50/40 transition-colors">
                        <div className="w-36 shrink-0 px-2">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] font-semibold text-blue-600">
                              {jobCard.jobId ?? `Item ${jobCard.id}`}
                            </p>
                            {jobCard.jobDate && (
                              <p className="text-[9px] text-gray-500">{formatDisplayDate(jobCard.jobDate)}</p>
                            )}
                          </div>
                        </div>
                        <div className="w-14 shrink-0 text-center font-mono text-[11px] text-gray-600">
                          {jobCard.totalOSPs}
                        </div>
                        <div className="w-24 shrink-0 flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge(jobCard.status)}`}>
                            {jobCard.status}
                          </span>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                          <div className="flex items-center gap-1">
                            {jobCard.stages.map((stage, idx) => (
                              <div key={idx} className="flex items-center gap-1 shrink-0">
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Truck className="w-4 h-4 text-blue-500" />
                                  <ChevronRight className="w-3 h-3 text-blue-400" />
                                </div>
                                <div
                                  className={`flex w-fit min-w-[120px] max-w-[220px] flex-col items-stretch rounded ring-1 ${stage.status === "on-track"
                                    ? "ring-green-400"
                                    : stage.status === "at-risk"
                                      ? "ring-amber-400"
                                      : stage.status === "delayed"
                                        ? "ring-red-400"
                                        : "ring-gray-200"
                                    } bg-white overflow-hidden`}
                                >
                                  <div className="flex w-full divide-x divide-gray-100">
                                    <div className="flex min-w-[58px] flex-col items-center px-1.5 py-1 border-green-300 bg-green-50">
                                      <span className="text-[8px] font-semibold text-gray-400 leading-none uppercase tracking-wide">
                                        Queue
                                      </span>
                                      <span className="text-[10px] font-semibold text-gray-700 font-mono leading-tight my-[3px]">
                                        {stage.queue ?? "-"}
                                      </span>
                                      <CircleCheckBig className="w-2 h-2 text-green-500" />
                                    </div>
                                    <div className="flex min-w-[58px] flex-col items-center px-1.5 py-1 border-green-300 bg-green-50">
                                      <span className="text-[8px] font-semibold text-gray-400 leading-none uppercase tracking-wide">
                                        TO MOVE
                                      </span>
                                      <span className="text-[10px] font-semibold text-gray-700 font-mono leading-tight my-[3px]">
                                        {stage.toMove ?? "-"}
                                      </span>
                                      <CircleCheckBig className="w-2 h-2 text-green-500" />
                                    </div>
                                    <div className="flex min-w-[58px] flex-col items-center px-1.5 py-1 border-green-300 bg-green-50">
                                      <span className="text-[8px] font-semibold text-gray-400 leading-none uppercase tracking-wide">
                                        Scrap
                                      </span>
                                      <span className="text-[10px] font-semibold text-gray-700 font-mono leading-tight my-[3px]">
                                        {stage.scrap ?? "-"}
                                      </span>
                                      <CircleCheckBig className="w-2 h-2 text-green-500" />
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-100 border-t border-gray-100 px-1 py-[2px] text-center text-[10px] font-medium text-gray-400 tracking-wide break-words leading-snug">
                                    {stage.name}
                                  </div>
                                  <div className="w-full bg-gray-100 border-t border-gray-100 px-1 py-[2px] text-center text-[10px] font-medium text-gray-400 tracking-wide break-words leading-snug">
                                    {stage.vendorName}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-3">
                Variance by Stage (Avg Days)
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {varianceData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-3">
                Top Delayed Job Card (by Avg Variance)
              </h3>
              <div className="space-y-2.5">
                {delayedOSPs.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 w-36 shrink-0 truncate">
                      {item.name}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${Math.min(item.value * 20, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-red-600 font-mono w-14 text-right">
                      +{item.value} Days
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                Jobs by Overall Status
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={38}
                        outerRadius={56}
                        stroke="#fff"
                      >
                        {statusData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-900 font-mono leading-none">
                      {totalJobs}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Total Jobs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <div>
                        <p className="text-[10px] text-gray-600">{item.name}</p>
                        <p className="text-[11px] font-semibold font-mono text-gray-800">
                          {item.value}{" "}
                          <span className="text-gray-400 font-normal">
                            ({Math.round((item.value / totalJobs) * 100)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- small reusable components -------------------- */

function FilterChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-white/10 border border-white/20 hover:border-blue-400 rounded px-2.5 py-1 cursor-pointer transition-colors min-w-[90px]">
      <span className="text-[9px] text-white/50 leading-none">{label}</span>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span className="text-[11px] font-medium text-white/90">{value}</span>
        {icon}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  subClass = "text-gray-400",
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  subClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2.5 shadow-sm flex-1 min-w-[180px]">
      <div className="mt-0.5 shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 leading-none mb-1 whitespace-nowrap">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 leading-none font-mono">{value}</p>
        <p className={`text-[11px] font-semibold mt-0.5 ${subClass}`}>{sub}</p>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
