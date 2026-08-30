import { apiClient } from "@/shared/lib/apiClient"
import type { ModuleModel, ProcedureResult } from "../types/models"

function mapModule(row: any): ModuleModel {
  return {
    moduleId: row.moduleId ?? row.MODULE_ID,
    moduleCode: row.moduleCode ?? row.MODULE_CODE ?? null,
    moduleName: row.moduleName ?? row.MODULE_NAME ?? "",
    description: row.description ?? row.DESCRIPTION ?? null,
    defaultMenu: row.defaultMenu ?? row.DEFAULT_MENU ?? null,
    sortOrder: row.sortOrder ?? row.SORT_ORDER ?? 0,
    remarks: row.remarks ?? row.REMARKS ?? null,
    status: row.status ?? row.STATUS ?? "INACTIVE",
  };
}

export const modulesApi = {
  list: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 101,
      inputParameters: {}
    });
    return res.data.map(mapModule);
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 102,
      inputParameters: { ModuleId: id }
    });
    return res.data.map(mapModule);
  },
  create: async (data: Partial<ModuleModel>): Promise<ProcedureResult> => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Modules",
      mainProps: data
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId,
      generatedCode: res.message?.includes("GeneratedCode: ") ? res.message.split("GeneratedCode: ")[1].trim() : null
    };
  },
  update: async (id: number, data: Partial<ModuleModel>): Promise<ProcedureResult> => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Modules",
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
      transactionName: "Modules",
      transactionId: id,
      delProps: {
        "Modules": [id]
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
