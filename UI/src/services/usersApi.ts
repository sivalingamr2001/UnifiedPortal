import { apiClient } from "@/shared/lib/apiClient"
import type { UserModel, ProcedureResult } from "../types/models"

export const usersApi = {
  list: () => apiClient.get<UserModel[]>("/users"),
  verifyEmployee: (employeeId: string) =>
    apiClient.get<{ found: boolean; employeeName: string | null }>(
      `/users/verify-employee/${encodeURIComponent(employeeId)}`
    ),
  get: (id: number) => apiClient.get<UserModel>(`/users/${id}`),
  create: (data: Partial<UserModel>) =>
    apiClient.post<ProcedureResult>("/users", data),
  update: (id: number, data: Partial<UserModel>) =>
    apiClient.put<ProcedureResult>(`/users/${id}`, data),
  changePassword: (id: number, newPassword: string) =>
    apiClient.put<ProcedureResult>(`/users/${id}/password`, { newPassword }),
  remove: (id: number) => apiClient.delete<ProcedureResult>(`/users/${id}`),
}
