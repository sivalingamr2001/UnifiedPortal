export { modulesApi } from "@/services/modulesApi";
export { rolesApi } from "@/services/rolesApi";
export { menusApi } from "@/services/menusApi";
export { usersApi } from "@/services/usersApi";
export { roleMenuApi } from "@/services/roleMenuApi";
export { userAccessRightsApi } from "@/services/userAccessRightsApi";
export { orgUnitsApi } from "@/services/orgUnitsApi";

import { apiClient } from "@/shared/lib/apiClient";
export const queryApi = {
  execute: async (body: { QueryNumber: number; InputParameters?: any }) => {
    return apiClient.post<any>("/query/execute", {
      queryNumber: body.QueryNumber,
      inputParameters: body.InputParameters || {}
    });
  }
};
