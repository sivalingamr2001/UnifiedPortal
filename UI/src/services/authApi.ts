import { apiClient } from "@/shared/lib/apiClient"
import type { LoginResponse } from "../types/models"

export const authApi = {
  login: (userName: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { userName, password }),
  logout: () => apiClient.post<void>("/auth/logout"),
}
