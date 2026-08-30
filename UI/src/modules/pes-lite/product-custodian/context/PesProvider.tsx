import { useLoader } from '@/shared/hooks/useLoader';
import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { pesApi, type PesConsolidatedData, type PesItemDetailedRow } from '../api/pesApi';

interface PesContextType {
    dashboardData: any;
    data: PesConsolidatedData[];
    itemDetails: PesItemDetailedRow[];
    loading: boolean;
    error: string | null;
    refreshData: (custodianName?: string, orgId?: string | number, level5?: string | null) => Promise<void>;
    reFetchDashboard: (custodianName?: string, orgId?: string | number, level5?: string | null) => Promise<void>;
    fetchItemDetails: (inventoryItemId: number) => Promise<void>;
    clearDetails: () => void;
}

const PesContext = createContext<PesContextType | null>(null);

interface PesProviderProps {
    children: ReactNode;
}

export const PesProvider: React.FC<PesProviderProps> = ({ children }) => {
    const [data, setData] = useState<PesConsolidatedData[]>([]);
    const [itemDetails, setItemDetails] = useState<PesItemDetailedRow[]>([]);
    const { loading, withLoader } = useLoader();
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);

    const fetchDashboardMetrics = useCallback(async (
        selectedCustodian?: string,
        selectedOrgId?: string | number,
        selectedLevel5?: string | null
    ): Promise<void> => {
        setError(null);
        try {
            const response = await withLoader(() =>
                pesApi.getDashboardMetrics(selectedCustodian, selectedOrgId, selectedLevel5)
            );

            setDashboardData(Array.isArray(response.data) ? response.data[0] : response.data || null);
        } catch (err: any) {
            console.error("Error loading consolidated PES data metrics:", err);
            setError(err?.message || "Failed to retrieve dataset from server.");
        }
    }, [withLoader]);

    const fetchPesConsolidated = useCallback(async (): Promise<void> => {
        setError(null);
        try {
            const response = await withLoader(() => pesApi.getPesConsolidated());
            setData(response.data || []);
        } catch (err: any) {
            console.error("Error loading consolidated PES data metrics:", err);
            setError(err?.message || "Failed to retrieve dataset from server.");
        }
    }, [withLoader]);

    const fetchItemDetails = useCallback(async (inventoryItemId: number): Promise<void> => {
        setError(null);
        try {
            const response = await withLoader(() => pesApi.getItemDetails(inventoryItemId));
            setItemDetails(response.data || []);
        } catch (err: any) {
            console.error("Error loading item details:", err);
            setError(err?.message || "Failed to retrieve item operational details.");
        }
    }, [withLoader]);

    const clearDetails = useCallback((): void => {
        setItemDetails([]);
    }, []);

    useEffect(() => {
        fetchPesConsolidated();
        fetchDashboardMetrics();
    }, [fetchPesConsolidated, fetchDashboardMetrics]);

    return (
        <PesContext.Provider
            value={{
                dashboardData,
                data,
                itemDetails,
                loading,
                error,
                refreshData: fetchPesConsolidated,
                fetchItemDetails,
                clearDetails,
                reFetchDashboard: fetchDashboardMetrics
            }}
        >
            {children}
        </PesContext.Provider>
    );
};

export const usePes = (): PesContextType => {
    const context = useContext(PesContext);
    if (!context) {
        throw new Error("usePes hook must be executed strictly within a <PesProvider> wrapper tree block.");
    }
    return context;
};
