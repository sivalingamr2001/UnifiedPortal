import { apiClient } from "@/shared/lib/apiClient"
import type { ModuleModel, ProcedureResult } from "../types/models"

export const modulesApi = {
  list: async () => {
    const res = await apiClient.post<{ data: ModuleModel[] }>("/query/execute", {
      queryNumber: 101,
      inputParameters: {}
    });
    return res.data;
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: ModuleModel[] }>("/query/execute", {
      queryNumber: 102,
      inputParameters: { ModuleId: id }
    });
    return res.data[0];
  },
  create: async (data: Partial<ModuleModel>) => {
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
  update: async (id: number, data: Partial<ModuleModel>) => {
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
