import { apiClient } from "./axiosClient";

export interface DashboardMetrics {
    AMS1_TOTAL: number,
    AMS2_TOTAL: number,
    SO_QTY: number,
    BIN_QTY: number,
    DEMAND: number,
    ACTIVEAMS1ITEMS: number,
    ACTIVEAMS2ITEMS: number,
    REQQTYSUMFORCONSTRAINT: number,
    REQQTYSUMFORUNCONSTRAINT: number,
    EXCEPTIONQTYSUMFORCONSTRAINT: number,
    EXCEPTIONQTYSUMFORUNCONSTRAINT: number
}

export interface PesConsolidatedData {
    ORG: string;
    ORGANIZATION_ID: number;
    ORDERED_ITEM: string;
    INVENTORY_ITEM_ID: number;
    DESCRIPTION: string;
    AMS_CAT: string;
    OCQ_QTY?: number;
    REQ_QTY: number;
    EXCEPTION_QTY: number;
    CONSTRAINT: string;
    SO_QTY: number;
    BIN_QTY: number;
    AMS1_TOTAL: number;
    AMS2_TOTAL: number;
    UPTO_LAST_MONTH: number;
    THIS_MONTH: number;
    NEXT_MONTH_ONWARDS: number;
    LEVEL_5: string;
    CUSTODIAN_NAME: string;
}

export interface PesItemDetailedRow {
    REGION: string;
    SP_WK_NO: number;
    HEADER_ID: number;
    LINE_ID: number;
    ORDERED_ITEM: string;
    INVENTORY_ITEM_ID: number;
    ORGANIZATION_ID: number;
    ORD_FF_DT: string;
    RSV_SOURCE: string;
    TO_BE_MFG: number;
    EXCESS_QTY: number;
    CONSTRAINT_T: string;
    CUSTOMER_CATEGORGY: string;
    CUSTOMER_ID: number;
    ORDER_NUMBER: number;
    AMS_CAT: string;
    BRANCH_TARGET_MONTH: string;
    HO_TARGET_MONTH: string;
    PROD_COMMIT_MONTH: string;
    EXCEPTION_QTY: number;
}

export interface PesComponentDetails {
    ORGANIZATION_ID: number;
    ORG: string;
    COMPONENT_ITEM_ID: number;
    LINE_ID: string;
    INPUT_ITEM_NO: string;
    COMPONENT_NO: string;
    DESCRIPTION: string;
    OS_TAG: string;
    COMMODITY: string;
    VENDOR_CATEGORY: string;
    NEW_ITEM_TYPE: string;
    SUPPLY_TYPE: number;
    FIRST_LEVEL_FLAG: string;
    SOURCE_TYPE: string;
    CONSTRAINT_FLAG: string;
    SHORTAGE_QTY: number;
    SOURCE_ORG: string;
    CMG_RSP: string;
}

export interface ProdCommitDateUpdateItem {
    lineId: number;
    rsvSource?: string;
    selectedMonth: string;
}

export interface UpdateProdCommitDateRequest {
    updates: ProdCommitDateUpdateItem[];
}

export const pesApi = {
    getDashboardMetrics: (custodianName?: string, orgId?: string | number, level5?: string | null) =>
        apiClient.get<DashboardMetrics[]>('/Pes/dashboard-metrics', {
            params: {
                custodianName: custodianName || undefined,
                orgId: orgId || undefined,
                level5: level5 || undefined
            }
        }),

    getPesConsolidated: () =>
        apiClient.get<PesConsolidatedData[]>("/Pes/pes-consolidated"),

    getItemDetails: (inventoryItemId: number) =>
        apiClient.get<PesItemDetailedRow[]>(`/Pes/item-details/${inventoryItemId}`),

    getComponentDetails: (LineId: number) =>
        apiClient.get<PesComponentDetails[]>(`/Pes/component-details/${LineId}`),

    updateProdCommitDate: async (data: UpdateProdCommitDateRequest) => {
        const { data: responseData } = await apiClient.post<{ updatedRows: number }>('/Pes/update-prod-commit-date', data);
        return responseData;
    }
}
