import { apiClient } from "@/shared/lib/apiClient"
import type { UserModel, ProcedureResult } from "../types/models"

export const usersApi = {
  list: async () => {
    const res = await apiClient.post<{ data: UserModel[] }>("/query/execute", {
      queryNumber: 107,
      inputParameters: {}
    });
    return res.data;
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: UserModel[] }>("/query/execute", {
      queryNumber: 108,
      inputParameters: { UserId: id }
    });
    return res.data[0];
  },
  verifyEmployee: async (employeeId: string) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 118,
      inputParameters: { EmployeeId: employeeId }
    });
    if (res.data.length > 0) {
      return { found: true, employeeName: res.data[0].employeeName };
    }
    return { found: false, employeeName: null };
  },
  create: async (data: Partial<UserModel>) => {
    const payload = { ...data };
    if (!payload.passwordHash) payload.passwordHash = "dummysalt_hash";
    if (!payload.passwordSalt) payload.passwordSalt = "dummysalt_salt";
    if (!payload.validFrom) payload.validFrom = new Date().toISOString().split('T')[0];
    
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserMaster",
      mainProps: payload
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId,
      generatedCode: res.message?.includes("GeneratedCode: ") ? res.message.split("GeneratedCode: ")[1].trim() : null
    };
  },
  update: async (id: number, data: Partial<UserModel>) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserMaster",
      transactionId: id,
      mainProps: data
    });
    return {
      success: res.success,
      message: res.message || "",
      newId: res.transactionId
    };
  },
  changePassword: async (id: number, newPassword: string) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserMaster",
      transactionId: id,
      mainProps: {
        passwordHash: `hash_of_${newPassword}`,
        passwordSalt: "dummysalt_salt"
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  },
  remove: async (id: number) => {
    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserMaster",
      transactionId: id,
      delProps: {
        "UserMaster": [id]
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
