import { apiClient } from "@/shared/lib/apiClient"
import type { ModuleModel, ProcedureResult } from "../types/models"

export const modulesApi = {
  list: () => apiClient.get<ModuleModel[]>("/modules"),
  get: (id: number) => apiClient.get<ModuleModel>(`/modules/${id}`),
  create: (data: Partial<ModuleModel>) =>
    apiClient.post<ProcedureResult>("/modules", data),
  update: (id: number, data: Partial<ModuleModel>) =>
    apiClient.put<ProcedureResult>(`/modules/${id}`, data),
  remove: (id: number) => apiClient.delete<ProcedureResult>(`/modules/${id}`),
}
