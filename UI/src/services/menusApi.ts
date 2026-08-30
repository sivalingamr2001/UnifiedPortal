import { apiClient } from "@/shared/lib/apiClient"
import type { MenuModel, ProcedureResult } from "../types/models"

export const menusApi = {
  list: async (moduleId?: number) => {
    const res = await apiClient.post<{ data: MenuModel[] }>("/query/execute", {
      queryNumber: moduleId ? 119 : 105,
      inputParameters: moduleId ? { ModuleId: moduleId } : {}
    });
    return res.data;
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: MenuModel[] }>("/query/execute", {
      queryNumber: 106,
      inputParameters: { MenuId: id }
    });
    return res.data[0];
  },
  create: async (data: Partial<MenuModel>) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Menus",
      mainProps: data
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId,
      generatedCode: res.message?.includes("GeneratedCode: ") ? res.message.split("GeneratedCode: ")[1].trim() : null
    };
  },
  update: async (id: number, data: Partial<MenuModel>) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "Menus",
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
      transactionName: "Menus",
      transactionId: id,
      delProps: {
        "Menus": [id]
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
