import { apiClient } from "@/shared/lib/apiClient"
import type { UserAccessRightsModel, ProcedureResult } from "../types/models"

export const userAccessRightsApi = {
  list: () => apiClient.get<UserAccessRightsModel[]>("/user-access-rights"),
  getByUser: (userId: number) =>
    apiClient.get<UserAccessRightsModel>(
      `/user-access-rights/by-user/${userId}`
    ),
  save: (data: UserAccessRightsModel) =>
    apiClient.post<ProcedureResult>("/user-access-rights", data),
  removeAllForUser: (userId: number) =>
    apiClient.delete<ProcedureResult>(`/user-access-rights/by-user/${userId}`),
}
