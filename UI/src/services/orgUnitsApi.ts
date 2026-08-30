import { apiClient } from "@/shared/lib/apiClient"
import type { OperatingUnitModel, OrganizationModel } from "../types/models"

export const orgUnitsApi = {
  listOperatingUnits: async () => {
    const res = await apiClient.post<{ data: OperatingUnitModel[] }>("/query/execute", {
      queryNumber: 120,
      inputParameters: {}
    });
    return res.data;
  },
  listOrganizations: async (operatingUnit: number) => {
    const res = await apiClient.post<{ data: OrganizationModel[] }>("/query/execute", {
      queryNumber: 121,
      inputParameters: { OperatingUnit: operatingUnit }
    });
    return res.data;
  }
}
