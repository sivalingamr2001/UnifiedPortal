import {
    Zap,
    Bell,
    Settings,
    BarChart2,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Hash,
    ArrowUpRight,
    Upload,
    X,
} from "lucide-react";

const NAV_ITEMS = [
    { icon: Bell, label: "Alerts", active: true, badge: 5 },
    { icon: Settings, label: "Workflows" },
    { icon: BarChart2, label: "Dashboards" },
    { icon: TrendingUp, label: "KPIs" },
];

const ALERTS = [
    {
        code: "FG-OP-A01",
        stage: "Inter-stage",
        desc: "Confirmed SA/FC supply (on-hand/in-store) < FG production requirement (upcoming 7 days)",
        time: "09:30 AM",
        active: true,
    },
    {
        code: "FG-OP-A02",
        stage: "Inter-stage",
        desc: "First-level Component Buffer shortage (in-store) projected to impact FG production (upcoming 15 days) — early warning signal",
        time: "09:15 AM",
    },
    {
        code: "FG-OP-A03",
        stage: "Intra-stage",
        desc: "FG production readiness check — current inventory + incoming receipts (SA/FC) in next 2 weeks is insufficient for next 4 Weeks FG production",
        time: "09:00 AM",
    },
    {
        code: "FG-OP-A04",
        stage: "Intra-stage",
        desc: "Daily cell loading plan against capacity (upcoming 3 days)",
        time: "08:45 AM",
    },
    {
        code: "FG-OP-A05",
        stage: "Inter-stage",
        desc: "Runner FG quantity (in-store) is less than AMS1 weekly planned quantity + executable orders for this week",
        time: "08:30 AM",
    },
];

const INFO_FIELDS = [
    { label: "Alert Type", value: "Inter-stage" },
    { label: "Threshold", value: "<30% for 7-day window" },
    { label: "Severity", value: "Critical", severity: true },
    { label: "Owner", value: "Product Custodian" },
    { label: "Detected", value: "Today, 09:30 AM" },
];

const IMPACTED_FGS = [
    "SV-2001",
    "SV-2002",
    "CF-3001",
    "CF-3002",
    "SV-2003",
    "CF-3003",
    "AC-4001",
    "FT-5001",
    "AC-4002",
    "MA-6001",
];

const IMPACT_ROWS = [
    {
        code: "SV-2001",
        desc: '5/2 Solenoid Valve 1/4" Single Coil',
        qty: 180,
        planned: 900,
        exec: 280,
        total: "1,180",
        shortage: "1,000",
        cause: "Supplier Delay",
    },
    {
        code: "SV-2002",
        desc: '5/2 Solenoid Valve 3/8" Double Coil',
        qty: 130,
        planned: 800,
        exec: 240,
        total: "1,040",
        shortage: "910",
        cause: "Prod. Schedule Mismatch",
    },
    {
        code: "CF-3001",
        desc: "Cylinder Ø32 Stroke 100mm",
        qty: 95,
        planned: 700,
        exec: 190,
        total: "890",
        shortage: "795",
        cause: "Supplier Delay",
    },
    {
        code: "CF-3002",
        desc: "Cylinder Ø40 Stroke 150mm",
        qty: 210,
        planned: 950,
        exec: 310,
        total: "1,260",
        shortage: "1,050",
        cause: "Prod. Schedule Mismatch",
    },
    {
        code: "SV-2003",
        desc: '5/3 Valve Centre Closed 1/4"',
        qty: 75,
        planned: 480,
        exec: 140,
        total: "620",
        shortage: "88%",
        cause: "Supplier Delay",
    },
    {
        code: "CF-3003",
        desc: "Cylinder Ø63 Stroke 200mm",
        qty: 160,
        planned: 870,
        exec: 250,
        total: "1,120",
        shortage: "86%",
        cause: "Supplier Delay",
    },
    {
        code: "AC-4001",
        desc: "Air Cylinder Guided 32mm Bore",
        qty: 115,
        planned: 580,
        exec: 170,
        total: "750",
        shortage: "85%",
        cause: "Prod. Schedule Mismatch",
    },
    {
        code: "FT-5001",
        desc: 'Filter Regulator Combo 1/4"',
        qty: 145,
        planned: 720,
        exec: 195,
        total: "915",
        shortage: "770",
        cause: "Supplier Delay",
    },
    {
        code: "AC-4002",
        desc: "Mini Cylinder Ø16 Stroke 50mm",
        qty: 105,
        planned: 630,
        exec: 180,
        total: "810",
        shortage: "705",
        cause: "Prod. Schedule Mismatch",
    },
    {
        code: "MA-6001",
        desc: 'Manifold Block 4-Station 1/4"',
        qty: 85,
        planned: 520,
        exec: 145,
        total: "665",
        shortage: "87%",
        cause: "Supplier Delay",
    },
];

const ROOT_CAUSES = [
    "Material shortage due to supplier delay — key components not received",
    "In-store inventory not sufficient to meet SA + executable demand",
];

const RECOMMENDED_ACTIONS = [
    "Expedite pending supplies from suppliers — raise priority POs",
    "Review and adjust production plan / reschedule to balance demand & inventory",
];

export default function FgAlertWorkbench() {
    return (
        <div
            className="
                flex h-screen overflow-hidden
                font-['Inter',system-ui,sans-serif]
                text-slate-800
            "
        >
            {/* ================= ICON RAIL ================= */}

            <div
                className="
                    flex w-[72px] shrink-0 flex-col items-center gap-1
                    border-r border-slate-800
                    bg-slate-900
                    py-4
                "
            >
                {/* Logo */}

                <div
                    className="
                        mb-4 flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-blue-500 to-indigo-500
                    "
                >
                    <Zap size={16} color="#fff" />
                </div>

                {/* Navigation */}

                {NAV_ITEMS.map(
                    ({ icon: Icon, label, active, badge }) => (
                        <div
                            key={label}
                            className={`
                                relative flex w-full cursor-pointer
                                flex-col items-center gap-1
                                py-3
                                transition-colors duration-150
                                ${active
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-transparent text-slate-500 hover:text-slate-300"
                                }
                            `}
                        >
                            {active && (
                                <div
                                    className="
                                        absolute left-0 top-1/2
                                        h-8 w-1
                                        -translate-y-1/2
                                        rounded-r
                                        bg-blue-400
                                    "
                                />
                            )}

                            {badge && (
                                <span
                                    className="
                                        absolute right-3 top-2
                                        flex h-4 w-4
                                        items-center justify-center
                                        rounded-full
                                        bg-red-500
                                        text-[8px] font-black text-white
                                    "
                                >
                                    {badge}
                                </span>
                            )}

                            <Icon size={16} />

                            <span className="text-[7px] font-semibold">
                                {label}
                            </span>
                        </div>
                    )
                )}

                {/* Collapse */}

                <div
                    className="
                        mt-auto flex cursor-pointer
                        flex-col items-center gap-1
                        py-3
                        text-slate-500
                        hover:text-slate-300
                    "
                >
                    <ChevronLeft size={14} />

                    <span className="text-[7px] font-semibold">
                        Collapse
                    </span>
                </div>
            </div>

            {/* ================= ALERT LIST PANEL ================= */}

            <div
                className="
                    flex w-[320px] shrink-0 flex-col overflow-hidden
                    border-r border-slate-200
                    bg-white
                "
            >
                {/* Header */}

                <div
                    className="
                        shrink-0 border-b border-slate-100
                        px-4 py-3
                    "
                >
                    <button
                        className="
                            mb-2 flex items-center gap-1
                            border-0 bg-transparent p-0
                            text-[10px] font-semibold text-slate-400
                            hover:text-blue-600
                        "
                    >
                        <ArrowLeft size={11} />
                        Back
                    </button>

                    <div className="flex items-center justify-between">
                        <span
                            className="
                                text-[12px] font-black uppercase
                                tracking-[0.03em] text-slate-800
                            "
                        >
                            Active Alerts{" "}
                            <span className="text-red-600">(5)</span>
                        </span>

                        <button
                            className="
                                flex items-center gap-1
                                rounded-lg border border-slate-200
                                bg-white px-2 py-1
                                text-[9px] font-bold text-slate-600
                                hover:border-blue-400
                            "
                        >
                            <Filter size={9} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Alert List */}

                <div className="flex-1 overflow-y-auto">
                    {ALERTS.map((a) => (
                        <button
                            key={a.code}
                            className={`
                                flex w-full items-start gap-3
                                border-b border-l-2 border-t-0 border-r-0
                                px-4 py-[14px] text-left
                                transition-colors
                                ${a.active
                                    ? "border-l-blue-500 bg-blue-50"
                                    : "border-l-transparent bg-transparent hover:bg-slate-50"
                                }
                            `}
                        >
                            {/* Alert Icon */}

                            <div
                                className="
                                    mt-[2px] flex h-6 w-6 shrink-0
                                    items-center justify-center
                                    rounded-full bg-red-500
                                "
                            >
                                <AlertTriangle
                                    size={11}
                                    color="#fff"
                                />
                            </div>

                            {/* Content */}

                            <div className="min-w-0 flex-1">
                                {/* Title */}

                                <div className="mb-1 flex flex-wrap items-center gap-[6px]">
                                    <span
                                        className="
                                            font-['JetBrains_Mono',ui-monospace,monospace]
                                            text-[10px] font-black
                                            text-slate-800
                                        "
                                    >
                                        {a.code}
                                    </span>

                                    <span
                                        className="
                                            rounded px-[6px] py-[1px]
                                            text-[7px] font-black
                                            text-white
                                            bg-red-500
                                        "
                                    >
                                        CRITICAL
                                    </span>

                                    <span
                                        className="
                                            rounded border border-slate-300
                                            bg-white px-2 py-[2px]
                                            text-[8px] font-black
                                            uppercase tracking-[0.03em]
                                            text-slate-600
                                        "
                                    >
                                        {a.stage}
                                    </span>
                                </div>

                                {/* Description */}

                                <div
                                    className="
                                        mb-1 text-[9px]
                                        leading-[1.35] text-slate-600
                                        line-clamp-3
                                    "
                                >
                                    {a.desc}
                                </div>

                                {/* Meta */}

                                <div className="text-[8px] text-slate-400">
                                    Detected: Today, {a.time}
                                    &nbsp;·&nbsp;
                                    Owner:{" "}
                                    <span className="font-semibold text-slate-500">
                                        Product Custodian
                                    </span>
                                </div>
                            </div>

                            <ChevronRight
                                size={11}
                                className="mt-1 shrink-0 text-slate-300"
                            />
                        </button>
                    ))}
                </div>

                {/* Footer */}

                <div
                    className="
                        shrink-0 border-t border-slate-100
                        px-4 py-2
                        text-[8px] text-slate-400
                    "
                >
                    Showing 1 to 5 of 5 alerts
                </div>
            </div>

            {/* ================= MAIN PANEL ================= */}

            <div className="flex-1 overflow-y-auto bg-white">
                {/* Main Header */}

                <div
                    className="
                        sticky top-0 z-20
                        flex items-start justify-between gap-4
                        border-b border-slate-200
                        bg-white
                        px-6 py-4
                    "
                >
                    <div className="min-w-0">
                        <div
                            className="
                                mb-[6px] flex flex-wrap
                                items-center gap-2
                            "
                        >
                            <span
                                className="
                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                    text-[16px] font-black text-slate-800
                                "
                            >
                                FG-OP-A01
                            </span>

                            <span
                                className="
                                    rounded bg-red-500
                                    px-2 py-[2px]
                                    text-[9px] font-black
                                    text-white
                                "
                            >
                                CRITICAL
                            </span>

                            <span
                                className="
                                    rounded border border-slate-300
                                    bg-white px-2 py-[2px]
                                    text-[8px] font-black
                                    uppercase tracking-[0.03em]
                                    text-slate-600
                                "
                            >
                                Inter-stage
                            </span>
                        </div>

                        <div
                            className="
                                max-w-[720px]
                                text-[12px] font-semibold
                                leading-[1.4] text-slate-700
                            "
                        >
                            Available stock + confirmed SA/FC receipts are
                            insufficient to cover FG production requirements
                            for the next 7 days across multiple AMS lines.
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            className="
                                flex items-center gap-[6px]
                                rounded-lg border border-blue-500
                                bg-blue-600
                                px-3 py-[6px]
                                text-[10px] font-black text-white
                                hover:bg-blue-700
                            "
                        >
                            <CheckCircle2 size={11} />
                            Acknowledge
                        </button>

                        <button
                            className="
                                flex items-center justify-center
                                rounded-lg border border-slate-200
                                bg-white p-[6px]
                                text-slate-500
                                hover:bg-slate-50
                            "
                        >
                            <Hash size={14} />
                        </button>
                    </div>
                </div>

                {/* ================= CONTENT ================= */}

                <div className="flex flex-col gap-5 px-6 py-4">
                    {/* ================= INFO BAR ================= */}

                    <div
                        className="
                            grid grid-cols-5 overflow-hidden
                            rounded-xl border border-slate-200
                        "
                    >
                        {INFO_FIELDS.map((f) => (
                            <div
                                key={f.label}
                                className="
                                    border-r border-slate-200
                                    bg-slate-50/60
                                    p-3
                                    last:border-r-0
                                "
                            >
                                <div
                                    className="
                                        mb-[2px]
                                        text-[7px]
                                        uppercase tracking-[0.05em]
                                        text-slate-400
                                    "
                                >
                                    {f.label}
                                </div>

                                <div
                                    className={`
                                        text-[10px] font-semibold
                                        ${f.severity
                                            ? "font-black text-red-600"
                                            : "text-slate-800"
                                        }
                                    `}
                                >
                                    {f.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ================= IMPACTED FGs ================= */}

                    <div
                        className="
                            overflow-hidden rounded-xl
                            border border-slate-200
                        "
                    >
                        {/* Card Header */}

                        <div
                            className="
                                flex items-center justify-between
                                border-b border-slate-200
                                bg-slate-50
                                px-4 py-[10px]
                            "
                        >
                            <div>
                                <span
                                    className="
                                        text-[11px] font-black
                                        text-slate-700
                                    "
                                >
                                    Impacted FGs
                                </span>

                                <span className="ml-2 text-[10px] text-slate-400">
                                    (10)
                                </span>
                            </div>

                            <button
                                className="
                                    flex items-center gap-1
                                    border-0 bg-transparent p-0
                                    text-[9px] font-bold text-blue-600
                                    hover:underline
                                "
                            >
                                View FG Shortage Details
                                <ArrowUpRight size={10} />
                            </button>
                        </div>

                        {/* Body */}

                        <div className="bg-white px-4 py-3">
                            <div
                                className="
                                    mb-2 text-[8px] text-slate-400
                                "
                            >
                                These FGs cannot be manufactured / assembled
                                due to the current condition.
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {IMPACTED_FGS.map((code) => (
                                    <span
                                        key={code}
                                        className="
                                            cursor-pointer rounded-lg
                                            border border-slate-200
                                            bg-slate-50
                                            px-[10px] py-1
                                            font-['JetBrains_Mono',ui-monospace,monospace]
                                            text-[9px] font-bold
                                            text-slate-700
                                            hover:border-blue-400
                                            hover:text-blue-700
                                        "
                                    >
                                        {code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ================= IMPACT DETAILS ================= */}

                    <div
                        className="
                            overflow-hidden rounded-xl
                            border border-slate-200
                        "
                    >
                        {/* Table Header */}

                        <div
                            className="
                                flex items-center justify-between
                                border-b border-slate-200
                                bg-slate-50
                                px-4 py-[10px]
                            "
                        >
                            <span
                                className="
                                    text-[11px] font-black uppercase
                                    tracking-[0.03em] text-slate-700
                                "
                            >
                                Impact Details
                            </span>

                            <button
                                className="
                                    flex items-center gap-[6px]
                                    rounded-lg border border-slate-300
                                    bg-white
                                    px-3 py-[6px]
                                    text-[9px] font-bold text-slate-600
                                    hover:border-blue-400
                                    hover:text-blue-600
                                "
                            >
                                <Upload size={10} />
                                Export
                            </button>
                        </div>

                        {/* Table */}

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[10px]">
                                <thead>
                                    <tr
                                        className="
                                            border-b border-slate-200
                                            bg-slate-100
                                        "
                                    >
                                        <th className="w-8 px-3 py-2 text-left text-[8px] font-black uppercase text-slate-500">
                                            #
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-left text-[8px] font-black uppercase text-slate-500">
                                            FG Code
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-left text-[8px] font-black uppercase text-slate-500">
                                            FG Description
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-right text-[8px] font-black uppercase text-slate-500">
                                            In-store Qty
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-right text-[8px] font-black uppercase text-slate-500">
                                            AMS1 Planned
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-right text-[8px] font-black uppercase text-slate-500">
                                            Exec. Orders
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-right text-[8px] font-black uppercase text-slate-500">
                                            Total Required
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-right text-[8px] font-black uppercase text-slate-500">
                                            Shortage
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-2 text-center text-[8px] font-black uppercase text-slate-500">
                                            Root Cause
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {IMPACT_ROWS.map((r, i) => (
                                        <tr
                                            key={r.code}
                                            className="
                                                border-b border-slate-50
                                                hover:bg-slate-50/60
                                            "
                                        >
                                            <td className="px-3 py-2 text-[9px] text-slate-400">
                                                {i + 1}
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    font-black text-slate-700
                                                "
                                            >
                                                {r.code}
                                            </td>

                                            <td className="max-w-[200px] px-3 py-2 text-slate-600">
                                                <div className="truncate">
                                                    {r.desc}
                                                </div>
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2 text-right
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    font-black text-red-600
                                                "
                                            >
                                                {r.qty}
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2 text-right
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    text-slate-600
                                                "
                                            >
                                                {r.planned}
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2 text-right
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    text-slate-600
                                                "
                                            >
                                                {r.exec}
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2 text-right
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    font-semibold text-slate-700
                                                "
                                            >
                                                {r.total}
                                            </td>

                                            <td
                                                className="
                                                    px-3 py-2 text-right
                                                    font-['JetBrains_Mono',ui-monospace,monospace]
                                                    font-black text-red-600
                                                "
                                            >
                                                {r.shortage}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`
                                                        whitespace-nowrap rounded
                                                        border px-[6px] py-[2px]
                                                        text-[7px] font-black
                                                        ${r.cause ===
                                                            "Supplier Delay"
                                                            ? "border-red-200 bg-red-100 text-red-700"
                                                            : "border-amber-200 bg-amber-100 text-amber-700"
                                                        }
                                                    `}
                                                >
                                                    {r.cause}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ================= BOTTOM GRID ================= */}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Root Cause */}

                        <div
                            className="
                                overflow-hidden rounded-xl
                                border border-slate-200
                            "
                        >
                            <div
                                className="
                                    border-b border-slate-200
                                    bg-slate-50
                                    px-3 py-2
                                "
                            >
                                <span
                                    className="
                                        text-[9px] font-black uppercase
                                        tracking-[0.04em] text-slate-700
                                    "
                                >
                                    Root Cause
                                </span>

                                <span className="ml-1 text-[8px] text-slate-400">
                                    (Overall)
                                </span>
                            </div>

                            <ul className="flex list-none flex-col gap-2 p-3">
                                {ROOT_CAUSES.map((text) => (
                                    <li
                                        key={text}
                                        className="flex items-start gap-2"
                                    >
                                        <div
                                            className="
                                                mt-[2px] flex h-4 w-4
                                                shrink-0 items-center justify-center
                                                rounded-full
                                                border border-red-300
                                                bg-red-100 text-red-600
                                            "
                                        >
                                            <X size={7} />
                                        </div>

                                        <span
                                            className="
                                                text-[9px]
                                                leading-[1.4] text-slate-700
                                            "
                                        >
                                            {text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommended Action */}

                        <div
                            className="
                                overflow-hidden rounded-xl
                                border border-slate-200
                            "
                        >
                            <div
                                className="
                                    border-b border-slate-200
                                    bg-slate-50
                                    px-3 py-2
                                "
                            >
                                <span
                                    className="
                                        text-[9px] font-black uppercase
                                        tracking-[0.04em] text-slate-700
                                    "
                                >
                                    Recommended Action
                                </span>

                                <span className="ml-1 text-[8px] text-slate-400">
                                    (Overall)
                                </span>
                            </div>

                            <ul className="flex list-none flex-col gap-2 p-3">
                                {RECOMMENDED_ACTIONS.map((text) => (
                                    <li
                                        key={text}
                                        className="flex items-start gap-2"
                                    >
                                        <div
                                            className="
                                                mt-[2px] flex h-4 w-4
                                                shrink-0 items-center justify-center
                                                rounded-full
                                                border border-emerald-300
                                                bg-emerald-100 text-emerald-600
                                            "
                                        >
                                            <CheckCircle2 size={7} />
                                        </div>

                                        <span
                                            className="
                                                text-[9px]
                                                leading-[1.4] text-slate-700
                                            "
                                        >
                                            {text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}