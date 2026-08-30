import { apiClient } from "@/shared/lib/apiClient"
import type { RoleModel, ProcedureResult } from "../types/models"

export const rolesApi = {
  list: async () => {
    const res = await apiClient.post<{ data: RoleModel[] }>("/query/execute", {
      queryNumber: 103,
      inputParameters: {}
    });
    return res.data;
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: RoleModel[] }>("/query/execute", {
      queryNumber: 104,
      inputParameters: { RoleId: id }
    });
    return res.data[0];
  },
  create: async (data: Partial<RoleModel>) => {
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
  update: async (id: number, data: Partial<RoleModel>) => {
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
