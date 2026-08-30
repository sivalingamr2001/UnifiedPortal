import { apiClient } from "@/shared/lib/apiClient"
import type { UserModel, ProcedureResult } from "../types/models"

function mapUser(row: any): UserModel {
  return {
    userId: row.userId ?? row.USER_ID,
    userCode: row.userCode ?? row.USER_CODE ?? null,
    employeeId: row.employeeId ?? row.EMPLOYEE_ID ?? "",
    fullName: row.fullName ?? row.FULL_NAME ?? "",
    userName: row.userName ?? row.USER_NAME ?? row.EMPLOYEE_ID ?? "",
    password: row.password ?? null,
    userType: row.userType ?? row.USER_TYPE ?? "EMPLOYEE",
    securityLevel: row.securityLevel ?? row.SECURITY_LEVEL ?? 10,
    roleId: row.roleId ?? row.ROLE_ID,
    roleName: row.roleName ?? row.ROLE_NAME ?? null,
    reportingTo: row.reportingTo ?? row.REPORTING_TO ?? null,
    reportsToName: row.reportsToName ?? row.REPORTS_TO_NAME ?? null,
    validFrom: row.validFrom ?? row.VALID_FROM ?? "",
    validTo: row.validTo ?? row.VALID_TO ?? null,
    status: row.status ?? row.STATUS ?? "INACTIVE",
    primaryEmail: row.primaryEmail ?? row.PRIMARY_EMAIL ?? null,
    primaryMobile: row.primaryMobile ?? row.PRIMARY_MOBILE ?? null,
    passwordPolicy: row.passwordPolicy ?? row.PASSWORD_POLICY ?? "",
    workOperatingUnit: row.workOperatingUnit ?? row.WORK_OPERATING_UNIT ?? null,
    theme: row.theme ?? row.THEME ?? "",
    timezone: row.timezone ?? row.TIMEZONE ?? "",
    maxSessions: row.maxSessions ?? row.MAX_SESSIONS ?? 1,
    loginWorkdaysOnly: row.loginWorkdaysOnly ?? row.LOGIN_WORKDAYS_ONLY ?? "Y",
    loginFromTime: row.loginFromTime ?? row.LOGIN_FROM_TIME ?? "00:00",
    loginToTime: row.loginToTime ?? row.LOGIN_TO_TIME ?? "23:59",
    allowedMachines: row.allowedMachines ?? row.ALLOWED_MACHINES ?? null,
    allowedIps: row.allowedIps ?? row.ALLOWED_IPS ?? null,
    digitalSigFile: row.digitalSigFile ?? row.DIGITAL_SIG_FILE ?? null,
    digitalSigPwdEnc: row.digitalSigPwdEnc ?? row.DIGITAL_SIG_PWD_ENC ?? null,
  };
}

export const usersApi = {
  list: async () => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 107,
      inputParameters: {}
    });
    return res.data.map(mapUser);
  },
  get: async (id: number) => {
    const res = await apiClient.post<{ data: any[] }>("/query/execute", {
      queryNumber: 108,
      inputParameters: { UserId: id }
    });
    return res.data[0] ? mapUser(res.data[0]) : undefined;
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
  create: async (data: Partial<UserModel>): Promise<ProcedureResult> => {
    const payload = { ...data } as any;
    delete payload.roleName;
    delete payload.reportsToName;
    delete payload.userCode;
    delete payload.userId;

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
  update: async (id: number, data: Partial<UserModel>): Promise<ProcedureResult> => {
    const payload = { ...data } as any;
    delete payload.roleName;
    delete payload.reportsToName;
    delete payload.userCode;
    delete payload.userId;

    const res = await apiClient.post<any>("/transaction/execute", {
      transactionName: "UserMaster",
      transactionId: id,
      mainProps: payload
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
        password: newPassword
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
      mainProps: {
        status: "INACTIVE"
      }
    });
    return {
      success: res.success,
      message: res.message || ""
    };
  }
}
