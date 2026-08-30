import { apiClient } from "@/shared/lib/apiClient"
import type {
  RoleMenuModel,
  ModuleAccessModel,
  ProcedureResult,
} from "../types/models"

function mapRoleMenu(row: any): RoleMenuModel {
  return {
    roleMenuId: row.roleMenuId ?? row.ROLE_MENU_ID ?? 0,
    roleId: row.roleId ?? row.ROLE_ID,
    roleName: row.roleName ?? row.ROLE_NAME ?? null,
    moduleId: row.moduleId ?? row.MODULE_ID,
    moduleName: row.moduleName ?? row.MODULE_NAME ?? null,
    menuId: row.menuId ?? row.MENU_ID,
    menuName: row.menuName ?? row.MENU_NAME ?? null,
    permView: row.permView ?? row.PERM_VIEW ?? "N",
    permAdd: row.permAdd ?? row.PERM_ADD ?? "N",
    permEdit: row.permEdit ?? row.PERM_EDIT ?? "N",
    permDelete: row.permDelete ?? row.PERM_DELETE ?? "N",
    permExport: row.permExport ?? row.PERM_EXPORT ?? "N",
    permApprove: row.permApprove ?? row.PERM_APPROVE ?? "N",
    restrictedColumns: row.restrictedColumns ?? row.RESTRICTED_COLUMNS ?? null,
  };
}

function mapModuleAccess(row: any): ModuleAccessModel {
  return {
    roleId: row.roleId ?? row.ROLE_ID,
    roleName: row.roleName ?? row.ROLE_NAME ?? "",
    moduleId: row.moduleId ?? row.MODULE_ID,
    moduleName: row.moduleName ?? row.MODULE_NAME ?? "",
    accessFlag: row.accessFlag ?? row.ACCESS_FLAG ?? "DENIED",
  };
}

export const roleMenuApi = {
  list: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 109,
      inputParameters: {}
    });
    return res.data.map(mapRoleMenu);
  },
  listByRole: async (roleId: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 113,
      inputParameters: { RoleId: roleId }
    });
    return res.data.map(mapRoleMenu);
  },
  listModuleAccess: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 114,
      inputParameters: {}
    });
    return res.data.map(mapModuleAccess);
  },
  listModuleAccessByRole: async (roleId: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 115,
      inputParameters: { RoleId: roleId }
    });
    return res.data.map(mapModuleAccess);
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
