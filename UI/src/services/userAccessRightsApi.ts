import { apiClient } from "@/shared/lib/apiClient"
import type { UserAccessRightsModel, ProcedureResult } from "../types/models"

export const userAccessRightsApi = {
  list: async () => {
    const res = await apiClient.post<{ data: UserAccessRightsModel[] }>("/query/execute", {
      queryNumber: 111,
      inputParameters: {}
    });
    return res.data;
  },
  getByUser: async (userId: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 117,
      inputParameters: { UserId: userId }
    });
    
    if (res.data.length === 0) {
      return {
        uarId: 0,
        userId: userId,
        userName: null,
        accessChannel: 'BOTH',
        status: 'ACTIVE',
        remarks: null,
        orgUnitsSelected: 0,
        totalOrgUnits: 0,
        orgUnits: []
      };
    }

    const first = res.data[0];
    const model: UserAccessRightsModel = {
      uarId: first.UAR_ID ?? 0,
      userId: userId,
      userName: null,
      accessChannel: (first.ACCESS_CHANNEL === 'ALL' || first.ACCESS_CHANNEL === 'BOTH') ? 'BOTH' : (first.ACCESS_CHANNEL || 'SYSTEM'),
      status: first.STATUS || 'ACTIVE',
      remarks: first.REMARKS || null,
      orgUnitsSelected: res.data.length,
      totalOrgUnits: res.data.length,
      orgUnits: res.data.map(r => ({
        uarId: r.UAR_ID,
        operatingUnit: r.OPERATING_UNIT,
        operatingUnitName: null,
        organizationId: r.ORGANIZATION_ID,
        organizationCode: `ORG${r.ORGANIZATION_ID}`,
        limitValue: r.LIMIT_VALUE
      }))
    };
    return model;
  },
  save: async (data: UserAccessRightsModel) => {
    const existing = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 117,
      inputParameters: { UserId: data.userId }
    });
    const existingUarIds = existing.data.map(r => r.UAR_ID).filter(id => id > 0);

    const childPropsOrgUnits = data.orgUnits.map(ou => ({
      uarId: ou.uarId || 0,
      userId: data.userId,
      operatingUnit: ou.operatingUnit,
      organizationId: ou.organizationId,
      limitValue: ou.limitValue,
      accessChannel: data.accessChannel || "SYSTEM",
      status: data.status || "ACTIVE",
      remarks: data.remarks || null,
      createdBy: "admin"
    }));

    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserAccessRights",
      transactionId: data.userId,
      mainProps: {},
      delProps: existingUarIds.length > 0 ? {
        "orgUnits": existingUarIds
      } : undefined,
      childProps: {
        "orgUnits": childPropsOrgUnits
      }
    });

    return {
      success: res.success,
      message: res.message || ""
    };
  },
  removeAllForUser: async (userId: number) => {
    const existing = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 117,
      inputParameters: { UserId: userId }
    });
    const existingUarIds = existing.data.map(r => r.UAR_ID).filter(id => id > 0);
    if (existingUarIds.length === 0) {
      return { success: true, message: "No rights found to delete" };
    }

    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserAccessRights",
      transactionId: userId,
      mainProps: {},
      delProps: {
        "orgUnits": existingUarIds
      }
    });

    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
