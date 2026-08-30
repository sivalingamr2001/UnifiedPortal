import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
    commodityApi,
    type CommodityData,
    type ComponentVsProductData,
    type DashboardConsolidatedMetrics,
    type AllSupplyData,
    type PendingPOSupplyData,
    type POInReceivingSupplyData,
    type JobPendingSupplyData,
} from "@/features/pes-lite/commodity-custodian/api/commodityApi";

// ---------- Context Interface Definition ----------

interface CommodityContextType {

    commodities: CommodityData[];
    dashboardMetrics: DashboardConsolidatedMetrics | null;
    loading: boolean;
    error: string | null;

    // Operational Actions
    fetchAllCommodities: () => Promise<void>;
    fetchDashboardMetrics: (custodianName?: string | null, orgId?: number | null) => Promise<void>;

    // Isolated Modal Data Fetchers (Returns data directly without polluting main list state)
    getAllSupply: (organizationId: number, itemNo: string) => Promise<AllSupplyData[]>;
    getPendingPOSupply: (organizationId: number, itemNo: string) => Promise<PendingPOSupplyData[]>;
    getPOInReceivingSupply: (organizationId: number, itemNo: string) => Promise<POInReceivingSupplyData[]>;
    getJobPendingSupply: (organizationId: number, itemNo: string) => Promise<JobPendingSupplyData[]>;
    getComponentVsProduct: (organizationId: number, itemNo: string) => Promise<ComponentVsProductData[]>;

    // State Utilities
    clearError: () => void;
}

const CommodityContext = createContext<CommodityContextType | undefined>(undefined);

// ---------- Provider Component Implementation ----------

export const CommodityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [commodities, setCommodities] = useState<CommodityData[]>([]);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardConsolidatedMetrics | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    // 1. Fetch Main Commodity Grid Collections
    const fetchAllCommodities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await commodityApi.getAllCommodities();
            setCommodities(response.data || []);
        } catch (err) {
            console.error("Error inside CommodityProvider [fetchAllCommodities]:", err);
            setError("Failed to fetch consolidated commodity datasets.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Fetch Dashboard Stat Card Summaries
    const fetchDashboardMetrics = useCallback(async (custodianName?: string | null, orgId?: number | null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await commodityApi.getDashboardMetricsConsolidated(custodianName, orgId);
            // Backend returns an array, pick the single summary row calculation row safely
            setDashboardMetrics(response.data?.[0] || null);
        } catch (err) {
            console.error("Error inside CommodityProvider [fetchDashboardMetrics]:", err);
            setError("Failed to compile dashboard aggregation metrics summaries.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Isolated Fetcher - Master Supply logs
    const getAllSupply = useCallback(async (organizationId: number, itemNo: string) => {
        try {
            const response = await commodityApi.getAllSupply(organizationId, itemNo);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching Master Supply logs:", err);
            throw new Error("Failed to load global summary supply track logs.");
        }
    }, []);

    // 4. Isolated Fetcher - Pending Purchase Orders
    const getPendingPOSupply = useCallback(async (organizationId: number, itemNo: string) => {
        try {
            const response = await commodityApi.getPendingPOSupply(organizationId, itemNo);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching Pending PO records:", err);
            throw new Error("Failed to retrieve unresolved vendor procurement files.");
        }
    }, []);

    // 5. Isolated Fetcher - PO In Receiving 
    const getPOInReceivingSupply = useCallback(async (organizationId: number, itemNo: string) => {
        try {
            const response = await commodityApi.getPOInReceivingSupply(organizationId, itemNo);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching receiving queue items:", err);
            throw new Error("Failed to inspect shipping bay verification metrics.");
        }
    }, []);

    // 6. Isolated Fetcher - Pending Jobs Tracking
    const getJobPendingSupply = useCallback(async (organizationId: number, itemNo: string) => {
        try {
            const response = await commodityApi.getJobPendingSupply(organizationId, itemNo);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching pending production lines:", err);
            throw new Error("Failed to trace internal job pipeline backlog metrics.");
        }
    }, []);

    // 7. Isolated Fetcher - Component vs Product Mapping (Linkages)
    const getComponentVsProduct = useCallback(async (organizationId: number, itemNo: string) => {
        try {
            const response = await commodityApi.getComponentVsProduct(organizationId, itemNo);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching Component vs Product linkages:", err);
            throw new Error("Failed to trace item assembly relationships.");
        }
    }, []);

    const value = useMemo(
        () => ({
            commodities,
            dashboardMetrics,
            loading,
            error,
            fetchAllCommodities,
            fetchDashboardMetrics,
            getAllSupply,
            getPendingPOSupply,
            getPOInReceivingSupply,
            getJobPendingSupply,
            getComponentVsProduct,
            clearError,
        }),
        [
            commodities,
            dashboardMetrics,
            loading,
            error,
            fetchAllCommodities,
            fetchDashboardMetrics,
            getAllSupply,
            getPendingPOSupply,
            getPOInReceivingSupply,
            getJobPendingSupply,
            getComponentVsProduct,
            clearError,
        ]
    );

    return <CommodityContext.Provider value={value}>{children}</CommodityContext.Provider>;
};

// ---------- Context Hook Consumer Access Layer ----------

export const useCommodity = () => {
    const context = useContext(CommodityContext);
    if (context === undefined) {
        throw new Error("useCommodity context hooks must be explicitly executed within a <CommodityProvider /> block layout wrapper.");
    }
    return context;
};
