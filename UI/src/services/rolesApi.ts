import { apiClient } from "@/shared/lib/apiClient"
import type { RoleModel, ProcedureResult } from "../types/models"

export const rolesApi = {
  list: () => apiClient.get<RoleModel[]>("/roles"),
  get: (id: number) => apiClient.get<RoleModel>(`/roles/${id}`),
  create: (data: Partial<RoleModel>) =>
    apiClient.post<ProcedureResult>("/roles", data),
  update: (id: number, data: Partial<RoleModel>) =>
    apiClient.put<ProcedureResult>(`/roles/${id}`, data),
  remove: (id: number) => apiClient.delete<ProcedureResult>(`/roles/${id}`),
}
