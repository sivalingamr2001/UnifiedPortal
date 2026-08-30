import { apiClient } from "@/shared/lib/apiClient"
import type { OperatingUnitModel, OrganizationModel } from "../types/models"

function mapOperatingUnit(row: any): OperatingUnitModel {
  return {
    operatingUnit: row.operatingUnit ?? row.OPERATING_UNIT,
    operatingUnitName: row.operatingUnitName ?? row.OPERATING_UNIT_NAME ?? "",
  };
}

function mapOrganization(row: any): OrganizationModel {
  return {
    organizationId: row.organizationId ?? row.ORGANIZATION_ID,
    organizationCode: row.organizationCode ?? row.ORGANIZATION_CODE ?? "",
  };
}

export const orgUnitsApi = {
  listOperatingUnits: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 120,
      inputParameters: {}
    });
    return res.data.map(mapOperatingUnit);
  },
  listOrganizations: async (operatingUnit: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 121,
      inputParameters: { OperatingUnit: operatingUnit }
    });
    return res.data.map(mapOrganization);
  }
}
