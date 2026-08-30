import { apiClient } from "./axiosClient";

// ---------- Core Grid Interfaces ----------

export interface CommodityData {
    ORGANIZATION_ID: number;
    COMPONENT_ITEM_ID: number;
    SOURCE_ORG: string;
    ORG: string;
    COMPONENT_NO: string;
    DESCRIPTION: string;
    UPTO_MONTH_MINUS_TWO: number;
    LAST_MONTH: number;
    THIS_MONTH: number;
    MONTH_PLUS_ONE: number;
    MONTH_PLUS_TWO_ONWARDS: number;
    UOM: string;
    CONSTRAINT_FLAG: string;
    CMG_FLAG: string | null;
    NEW_ITEM_TYPE: string;
    CUSTODIAN_CODE: string | null;
    CUSTODIAN_NAME: string | null;
    VENDOR_CATEGORY: string;
    COMMODITY: string;
    RM_IMPORT_FLAG: string;
    OS_TAG: string;
    PROCUREMENT_CATEGORY: string;
    OPTIMUM_QTY: number;
    RELEASE_METHOD: string;
    SOURCE_ID: number | null;
    AMS_FLAG: string;
    OCQ_QUANTITY: number;
}

// Added Component Vs Product mapping response type
export interface ComponentVsProductData {
    ORGANIZATION_ID: number;
    COMPONENT_ITEM_ID: number;
    INPUT_ITEM_ID: number;
    DESCRIPTION: string;
    SCHEDULE_MONTH: number;
    ORG: string;
    INPUT_ITEM_NO: string;
    COMPONENT_NO: string;
    PEGGING_SHORTAGE_QTY: number;
    CONSTRAINT_FLAG: string;
}

// Added Dashboard consolidated summary cards metric data type
export interface DashboardConsolidatedMetrics {
    SHORTAGE_TRACK_1A: number;
    SHORTAGE_TRACK_1B: number;
    SHORTAGE_TRACK_2: number;
    OVERDUE_TRACK_1A: number;
    OVERDUE_TRACK_1B: number;
    OVERDUE_TRACK_2: number;
    TOTAL_TRACK_1A: number;
    TOTAL_TRACK_1B: number;
    TOTAL_TRACK_2: number;
}

// ---------- Supply Subquery Modals Data Layouts ----------

export interface AllSupplyData {
    ORGANIZATION_ID: number;
    INVENTORY_ITEM_ID: number;
    ORG: string;
    ITEM_NO: string;
    DESCRIPTION: string;
    ONHAND: number;
    PO_PENDING: number;
    PO_IN_RECEIVING: number;
    JOB_PENDING: number;
}

export interface PendingPOSupplyData {
    ORG: string;
    ITEM_NO: string;
    REV: string;
    DESCRIPTION: string;
    PONO: string;
    PODT: string;
    NEED_BY_DATE: string;
    PO_PENDING: number;
    SUPPLIER: string;
    CFD_OPEN: string;
}

export interface POInReceivingSupplyData {
    ORG: string;
    ITEM_NO: string;
    REVISION: string;
    DESCRIPTION: string;
    PONO: string;
    PODT: string;
    NEED_BY_DATE: string;
    PO_IN_REC_QTY: number;
    SUPPLIER: string;
}

export interface JobPendingSupplyData {
    ORG: string;
    ITEM_NO: string;
    REVISION: string;
    DESCRIPTION: string;
    PONO: string | null;
    PODT: string | null;
    NEED_BY_DATE: string;
    JOB_NO: string | null;
    JOB_DT: string | null;
    JOB_PENDING: number;
    SUPPLIER: string | null;
}

// ---------- API Routing Call Endpoints ----------

export const commodityApi = {
    // Added unified dashboard summary numbers tracker with query mapping hooks
    getDashboardMetricsConsolidated: (custodianName?: string | null, orgId?: number | null) =>
        apiClient.get<DashboardConsolidatedMetrics[]>("/Commodity/dashboard-consolidated", {
            params: { custodianName, orgId }
        }),

    getAllCommodities: () =>
        apiClient.get<CommodityData[]>("/Commodity/commodity-consolidated"),

    getAllSupply: (organizationId: number, itemNo: string) =>
        apiClient.get<AllSupplyData[]>("/Commodity/all-supply", {
            params: { organizationId, itemNo }
        }),

    getPendingPOSupply: (organizationId: number, itemNo: string) =>
        apiClient.get<PendingPOSupplyData[]>("/Commodity/pending-po-supply", {
            params: { organizationId, itemNo }
        }),

    getPOInReceivingSupply: (organizationId: number, itemNo: string) =>
        apiClient.get<POInReceivingSupplyData[]>("/Commodity/po-in-receiving-supply", {
            params: { organizationId, itemNo }
        }),

    getJobPendingSupply: (organizationId: number, itemNo: string) =>
        apiClient.get<JobPendingSupplyData[]>("/Commodity/job-pending-supply", {
            params: { organizationId, itemNo }
        }),

    // Added view action endpoint for product mapping
    getComponentVsProduct: (organizationId: number, componentNo: string) =>
        apiClient.get<ComponentVsProductData[]>("/Commodity/component-vs-product", {
            params: { organizationId, componentNo }
        }),
};
