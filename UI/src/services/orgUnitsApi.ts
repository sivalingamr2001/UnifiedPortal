import { apiClient } from "@/shared/lib/apiClient"
import type { OperatingUnitModel, OrganizationModel } from "../types/models"

export const orgUnitsApi = {
  listOperatingUnits: () =>
    apiClient.get<OperatingUnitModel[]>("/org-units/operating-units"),
  listOrganizations: (operatingUnit: number) =>
    apiClient.get<OrganizationModel[]>(
      `/org-units/organizations?operatingUnit=${encodeURIComponent(operatingUnit)}`
    ),
}
