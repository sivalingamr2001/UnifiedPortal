import { apiClient } from "@/shared/lib/apiClient"
import type {
  RoleMenuModel,
  ModuleAccessModel,
  ProcedureResult,
} from "../types/models"

export const roleMenuApi = {
  list: () => apiClient.get<RoleMenuModel[]>("/role-menu"),
  listByRole: (roleId: number) =>
    apiClient.get<RoleMenuModel[]>(`/role-menu/by-role/${roleId}`),
  listModuleAccess: () =>
    apiClient.get<ModuleAccessModel[]>("/role-menu/module-access"),
  listModuleAccessByRole: (roleId: number) =>
    apiClient.get<ModuleAccessModel[]>(
      `/role-menu/module-access/by-role/${roleId}`
    ),
  getRestrictedColumns: (menuId: number) =>
    apiClient.get<string[]>(`/role-menu/restricted-columns/${menuId}`),
  save: (data: RoleMenuModel) =>
    apiClient.post<ProcedureResult>("/role-menu", data),
  remove: (id: number) => apiClient.delete<ProcedureResult>(`/role-menu/${id}`),
}
