import { apiClient } from "@/shared/lib/apiClient"
import type { MenuModel, ProcedureResult } from "../types/models"

function mapMenu(row: any): MenuModel {
  return {
    menuId: row.menuId ?? row.MENU_ID,
    menuCode: row.menuCode ?? row.MENU_CODE ?? null,
    menuName: row.menuName ?? row.MENU_NAME ?? "",
    displayName: row.displayName ?? row.DISPLAY_NAME ?? row.MENU_NAME ?? "",
    moduleId: row.moduleId ?? row.MODULE_ID,
    moduleName: row.moduleName ?? row.MODULE_NAME ?? null,
    parentMenuId: row.parentMenuId ?? row.PARENT_MENU_ID ?? null,
    menuType: row.menuType ?? row.MENU_TYPE ?? "MASTER",
    nature: row.nature ?? row.NATURE ?? "FORM",
    sortOrder: row.sortOrder ?? row.SORT_ORDER ?? 0,
    status: row.status ?? row.STATUS ?? "INACTIVE",
  };
}

export const menusApi = {
  list: async (moduleId?: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: moduleId ? 119 : 105,
      inputParameters: moduleId ? { ModuleId: moduleId } : {}
    });
    return res.data.map(mapMenu);
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 106,
      inputParameters: { MenuId: id }
    });
    return res.data[0] ? mapMenu(res.data[0]) : undefined;
  },
  create: async (data: Partial<MenuModel>): Promise<ProcedureResult> => {
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
  update: async (id: number, data: Partial<MenuModel>): Promise<ProcedureResult> => {
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
