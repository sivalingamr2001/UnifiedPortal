import { apiClient } from "@/shared/lib/apiClient"
import type { RoleModel, ProcedureResult } from "../types/models"

function mapRole(row: any): RoleModel {
  return {
    roleId: row.roleId ?? row.ROLE_ID,
    roleCode: row.roleCode ?? row.ROLE_CODE ?? null,
    roleName: row.roleName ?? row.ROLE_NAME ?? "",
    sourceType: row.sourceType ?? row.SOURCE_TYPE ?? "USER",
    remarks: row.remarks ?? row.REMARKS ?? null,
    roleVersion: String(row.roleVersion ?? row.ROLE_VERSION ?? 1),
    status: row.status ?? row.STATUS ?? "INACTIVE",
  };
}

export const rolesApi = {
  list: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 103,
      inputParameters: {}
    });
    return res.data.map(mapRole);
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 104,
      inputParameters: { RoleId: id }
    });
    return res.data[0] ? mapRole(res.data[0]) : undefined;
  },
  create: async (data: Partial<RoleModel>): Promise<ProcedureResult> => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Roles",
      mainProps: data
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId,
      generatedCode: res.message?.includes("GeneratedCode: ") ? res.message.split("GeneratedCode: ")[1].trim() : null
    };
  },
  update: async (id: number, data: Partial<RoleModel>): Promise<ProcedureResult> => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Roles",
      transactionId: id,
      mainProps: data
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId
    };
  },
  remove: async (id: number) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Roles",
      transactionId: id,
      delProps: {
        "Roles": [id]
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
