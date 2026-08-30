import { apiClient } from "@/shared/lib/apiClient"
import type {
  RoleMenuModel,
  ModuleAccessModel,
  ProcedureResult,
} from "../types/models"

export const roleMenuApi = {
  list: async () => {
    const res = await apiClient.post<{ data: RoleMenuModel[] }>("/query/execute", {
      queryNumber: 109,
      inputParameters: {}
    });
    return res.data;
  },
  listByRole: async (roleId: number) => {
    const res = await apiClient.post<{ data: RoleMenuModel[] }>("/query/execute", {
      queryNumber: 113,
      inputParameters: { RoleId: roleId }
    });
    return res.data;
  },
  listModuleAccess: async () => {
    const res = await apiClient.post<{ data: ModuleAccessModel[] }>("/query/execute", {
      queryNumber: 114,
      inputParameters: {}
    });
    return res.data;
  },
  listModuleAccessByRole: async (roleId: number) => {
    const res = await apiClient.post<{ data: ModuleAccessModel[] }>("/query/execute", {
      queryNumber: 115,
      inputParameters: { RoleId: roleId }
    });
    return res.data;
  },
  getRestrictedColumns: async (menuId: number) => {
    const res = await apiClient.post<{ data: { RESTRICTED_COLUMNS: string }[] }>("/query/execute", {
      queryNumber: 116,
      inputParameters: { MenuId: menuId }
    });
    const colStr = res.data[0]?.RESTRICTED_COLUMNS;
    return colStr ? colStr.split(",").map(c => c.trim()) : [];
  },
  save: async (data: RoleMenuModel) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "RoleMenu",
      transactionId: data.roleMenuId,
      mainProps: {
        roleId: data.roleId,
        moduleId: data.moduleId,
        menuId: data.menuId,
        permView: data.permView || "N",
        permAdd: data.permAdd || "N",
        permEdit: data.permEdit || "N",
        permDelete: data.permDelete || "N",
        permExport: data.permExport || "N",
        permApprove: data.permApprove || "N",
        restrictedColumns: data.restrictedColumns || null
      }
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId
    };
  },
  remove: async (id: number) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "RoleMenu",
      transactionId: id,
      delProps: {
        "RoleMenu": [id]
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
