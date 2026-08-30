import { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { queryApi } from "../../../api/endpoints";

type Category =
    | "Inventory"
    | "Orders"
    | "Vendor"
    | "Consumption";

type Severity = "Critical" | "Warning";

interface AlertItem {
    alertId: number;
    alertTrxId: number | null;

    code: string;
    severity: Severity;
    category: Category;

    desc: string;
    time: string;
    assignedTo: string;

    /**
     * Value coming from database.
     *
     * Examples:
     * /alerts/page1
     * alerts/page1
     * page1
     */
    alterRefPageName: string;

    active?: boolean;
    dimmed?: boolean;
}

/* =========================================================
   SEVERITY
========================================================= */

const getSeverity = (value?: string): Severity => {
    return String(value || "")
        .trim()
        .toUpperCase() === "CRITICAL"
        ? "Critical"
        : "Warning";
};

/* =========================================================
   CATEGORY
========================================================= */

const getCategory = (value?: string): Category => {
    const normalized = String(value || "")
        .trim()
        .toUpperCase();

    if (normalized.includes("ORDER")) {
        return "Orders";
    }

    if (normalized.includes("VENDOR")) {
        return "Vendor";
    }

    if (normalized.includes("CONSUM")) {
        return "Consumption";
    }

    return "Inventory";
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (date?: string | null): string => {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return parsedDate.toLocaleString();
};

/* =========================================================
   BUILD ALERT PAGE PATH
=========================================================

   Database may contain any of:

   /alerts/page1
   alerts/page1
   page1

   The route is actually registered (see router.tsx) nested
   under the "pes" parent route:

       { path: 'pes', children: [
           { path: 'alerts/page1/:alertTrxId', element: <AlertDetailsPage /> },
       ]}

   — so the full matched path is "pes/alerts/page1/:alertTrxId", not
   "alerts/page1/:alertTrxId". The previous version of this function
   built "/pes_lite/alerts/page1/9130", which was wrong twice over:

   1. It's missing the "pes/" segment the route actually lives under,
      so it could never match that route.
   2. It manually prepends the router's basename ('/pes_lite'). The
      router was created with `basename: '/pes_lite'` specifically so
      that basename gets added automatically by useNavigate()/<Link> —
      passing it in yourself fights that (this is the exact class of
      bug the LinkButton component elsewhere in router.tsx was already
      fixed for). Net effect: the browser URL changed (so it looked
      like navigation "worked"), but it didn't match any real route in
      the tree, so it silently fell through to the catch-all
      PageNotFound route instead of rendering AlertDetailsPage.

   This now returns a path relative to the router root (no basename,
   no leading slash needed beyond what's below), e.g.:

       pes/alerts/page1/9130
========================================================== */

const buildAlertPath = (
    pageName: string,
    alertTrxId: number
): string | null => {
    let path = String(pageName || "").trim();

    if (!path) {
        return null;
    }

    // Remove leading/trailing slashes
    path = path.replace(/^\/+|\/+$/g, "");

    /*
     * If DB only contains "page1",
     * convert it to "alerts/page1".
     */
    if (!path.startsWith("alerts/")) {
        path = `alerts/${path}`;
    }

    return `/pes/${path}/${alertTrxId}`;
};

/* =========================================================
   PAGE
========================================================= */

export default function AlertListPage() {
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);

    /* =====================================================
       LOAD ALERTS
    ===================================================== */

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);

            const response = await queryApi.execute({
                QueryNumber: 122,
            });

            const apiData: any[] =
                Array.isArray(response)
                    ? response
                    : Array.isArray((response as any)?.data)
                        ? (response as any).data
                        : [];

            console.log("Alert API response:", apiData);

            const mappedAlerts: AlertItem[] = apiData.map(
                (item: any) => ({
                    alertId: Number(
                        item.ALERT_ID || 0
                    ),

                    alertTrxId:
                        item.ALERT_TRX_ID !== null &&
                            item.ALERT_TRX_ID !== undefined &&
                            item.ALERT_TRX_ID !== ""
                            ? Number(item.ALERT_TRX_ID)
                            : null,

                    code:
                        item.ALERT_CODE ||
                        `AL-${item.ALERT_ID}`,

                    severity: getSeverity(
                        item.CONFIG_SEVERITY
                    ),

                    category: getCategory(
                        item.CONFIG_CLASSIFICATION
                    ),

                    desc:
                        item.ALERT_DESCRIPTION ||
                        item.ALERT_SUBJECT ||
                        "",

                    time: formatDate(
                        item.ALERT_TRIGGERED_TIME
                    ),

                    assignedTo:
                        item.ASSIGNED_TO
                            ? String(item.ASSIGNED_TO)
                            : "Unassigned",

                    /*
                     * IMPORTANT:
                     * Keep the database page name.
                     */
                    alterRefPageName:
                        item.ALTER_REF_PAGE_NAME
                            ? String(
                                item.ALTER_REF_PAGE_NAME
                            ).trim()
                            : "",

                    active: false,
                    dimmed: false,
                })
            );

            console.log(
                "Mapped alerts:",
                mappedAlerts
            );

            setAlerts(mappedAlerts);
        } catch (error) {
            console.error(
                "Failed to load alerts:",
                error
            );

            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       SELECT ALERT
    ===================================================== */

    const handleSelectAlert = (
        selected: AlertItem
    ) => {
        console.log(
            "Selected alert:",
            selected
        );

        /* -----------------------------------------------
           Validate transaction ID
        ------------------------------------------------ */

        if (
            selected.alertTrxId === null ||
            Number.isNaN(selected.alertTrxId)
        ) {
            window.alert(
                "ALERT_TRX_ID is missing."
            );

            return;
        }

        /* -----------------------------------------------
           Validate database page name
        ------------------------------------------------ */

        if (
            !selected.alterRefPageName ||
            selected.alterRefPageName.trim() === ""
        ) {
            window.alert(
                "ALTER_REF_PAGE_NAME is not configured."
            );

            return;
        }

        /* -----------------------------------------------
           Build destination
        ------------------------------------------------ */

        const destination = buildAlertPath(
            selected.alterRefPageName,
            selected.alertTrxId
        );

        if (!destination) {
            window.alert(
                "Invalid ALTER_REF_PAGE_NAME."
            );

            return;
        }

        console.log(
            "Navigating to:",
            destination
        );

        /*
         * IMPORTANT:
         *
         * This uses React Router.
         *
         * It opens in the SAME browser window.
         * No window.open().
         * No new tab.
         */
        navigate(destination);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="flex h-screen bg-white">

            {/* =================================================
                LEFT ALERT SIDEBAR
            ================================================= */}

            <div className="flex w-[380px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">

                    <div className="mb-0.5 flex items-center justify-between">

                        <span className="text-[12px] font-black uppercase tracking-[0.03em] text-slate-800">

                            Active Alerts{" "}

                            <span className="text-[11px] text-red-600">
                                ({alerts.length})
                            </span>

                        </span>

                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-600"
                        >
                            Filter
                        </button>

                    </div>

                    <div className="text-[8px] text-slate-400">
                        Root-cause alerts only · Symptoms &
                        duplicates suppressed
                    </div>

                </div>

                {/* =================================================
                    ALERT LIST
                ================================================= */}

                <div className="flex-1 overflow-y-auto">

                    {/* LOADING */}

                    {loading ? (
                        <div className="p-4 text-center text-[10px] text-slate-400">
                            Loading alerts...
                        </div>
                    ) : alerts.length === 0 ? (

                        /* NO ALERTS */

                        <div className="p-4 text-center text-[10px] text-slate-400">
                            No alerts found
                        </div>

                    ) : (

                        /* ALERTS */

                        alerts.map((a) => {

                            const isCritical =
                                a.severity === "Critical";

                            return (
                                <button
                                    key={
                                        a.alertTrxId ??
                                        a.alertId
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleSelectAlert(a)
                                    }
                                    className={`
                                        group
                                        flex
                                        w-full
                                        items-start
                                        gap-3
                                        border-b
                                        border-slate-200
                                        px-3
                                        py-3
                                        text-left
                                        transition-all

                                        ${a.active
                                            ? "border-l-[3px] border-l-red-500 bg-red-50/40"
                                            : "border-l-[3px] border-l-transparent bg-white hover:bg-slate-50"
                                        }

                                        ${a.dimmed
                                            ? "opacity-60"
                                            : ""
                                        }
                                    `}
                                >

                                    {/* =================================
                                        ALERT ICON
                                    ================================= */}

                                    <div
                                        className={`
                                            mt-1
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full

                                            ${isCritical
                                                ? "bg-red-500"
                                                : "bg-amber-500"
                                            }
                                        `}
                                    >
                                        <AlertTriangle
                                            size={13}
                                            className="text-white"
                                            strokeWidth={2.5}
                                        />
                                    </div>

                                    {/* =================================
                                        CONTENT
                                    ================================= */}

                                    <div className="min-w-0 flex-1">

                                        {/* CODE / SEVERITY / CATEGORY */}

                                        <div className="mb-1 flex flex-wrap items-center gap-2">

                                            <span className="font-mono text-[11px] font-bold tracking-wide text-slate-600">
                                                {a.code}
                                            </span>

                                            <span
                                                className={`
                                                    rounded
                                                    px-2
                                                    py-1
                                                    text-[9px]
                                                    font-black
                                                    uppercase
                                                    tracking-wide
                                                    text-white

                                                    ${isCritical
                                                        ? "bg-red-500"
                                                        : "bg-amber-500"
                                                    }
                                                `}
                                            >
                                                {a.severity}
                                            </span>

                                            <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">
                                                {a.category}
                                            </span>

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="max-w-[285px] text-[9px] text-slate-700">
                                            {a.desc}
                                        </div>

                                        {/* DATE / OWNER */}

                                        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[9px] text-slate-400">

                                            <span>
                                                Detected:{" "}
                                                {a.time}
                                            </span>

                                            <span className="text-slate-300">
                                                •
                                            </span>

                                            <span>
                                                Owner:{" "}

                                                <span className="font-semibold text-slate-500">
                                                    {
                                                        a.assignedTo
                                                    }
                                                </span>
                                            </span>

                                        </div>

                                    </div>

                                    {/* =================================
                                        ARROW
                                    ================================= */}

                                    <ChevronRight
                                        size={15}
                                        className="mt-2 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
                                    />

                                </button>
                            );
                        })
                    )}

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="shrink-0 border-t border-slate-100 px-4 py-2 text-[8px] text-slate-400">

                    Showing{" "}

                    {alerts.length > 0 ? 1 : 0}

                    {" "}to{" "}

                    {alerts.length}

                    {" "}of{" "}

                    {alerts.length}

                    {" "}alerts

                </div>

            </div>

        </div>
    );
}