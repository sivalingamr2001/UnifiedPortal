import { apiClient } from "@/shared/lib/apiClient"
import type { MenuModel, ProcedureResult } from "../types/models"

export const menusApi = {
  list: (moduleId?: number) =>
    apiClient.get<MenuModel[]>(
      `/menus${moduleId ? `?moduleId=${moduleId}` : ""}`
    ),
  get: (id: number) => apiClient.get<MenuModel>(`/menus/${id}`),
  create: (data: Partial<MenuModel>) =>
    apiClient.post<ProcedureResult>("/menus", data),
  update: (id: number, data: Partial<MenuModel>) =>
    apiClient.put<ProcedureResult>(`/menus/${id}`, data),
  remove: (id: number) => apiClient.delete<ProcedureResult>(`/menus/${id}`),
}
