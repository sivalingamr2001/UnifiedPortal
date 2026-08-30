export interface RoleModel {
  roleId: number
  roleCode: string | null // null = not yet assigned; auto-generated on create if left blank
  roleName: string
  sourceType: "FRAMEWORK" | "ADMIN" | "USER" | "DEVADMIN"
  remarks: string | null
  roleVersion: string
  status: "ACTIVE" | "INACTIVE"
}

export interface ModuleModel {
  moduleId: number
  moduleCode: string | null
  moduleName: string
  description?: string | null
  defaultMenu: string | null
  sortOrder: number
  remarks: string | null
  status: "ACTIVE" | "INACTIVE"
}

export interface MenuModel {
  menuId: number
  menuCode: string | null
  menuName: string
  displayName: string
  moduleId: number
  moduleName: string | null
  parentMenuId: number | null
  menuType: "MASTER" | "TRANSACTION" | "REPORT"
  nature: "FORM" | "REPORT"
  sortOrder: number
  status: "ACTIVE" | "INACTIVE"
}

export interface UserModel {
  userId: number
  userCode: string | null
  employeeId: string
  fullName: string
  userName: string
  password?: string | null
  userType:
    "EMPLOYEE" | "CONTRACT" | "CLIENT" | "SUPPLIER" | "CUSTOMER" | "EXTERNAL"
  securityLevel: number
  roleId: number
  roleName: string | null
  reportingTo: number | null
  reportsToName: string | null
  validFrom: string
  validTo: string | null
  status: "ACTIVE" | "INACTIVE"
  primaryEmail: string | null
  primaryMobile: string | null
  passwordPolicy: string
  workOperatingUnit: number | null
  theme: string
  timezone: string
  maxSessions: number
  loginWorkdaysOnly: "Y" | "N"
  loginFromTime: string
  loginToTime: string
  allowedMachines: string | null
  allowedIps: string | null
}

export interface RoleMenuModel {
  roleMenuId: number
  roleId: number
  roleName: string | null
  moduleId: number
  moduleName: string | null
  menuId: number
  menuName: string | null
  permView: "Y" | "N"
  permAdd: "Y" | "N"
  permEdit: "Y" | "N"
  permDelete: "Y" | "N"
  permExport: "Y" | "N"
  permApprove: "Y" | "N"
  restrictedColumns: string | null
}

export interface ModuleAccessModel {
  roleId: number
  roleName: string
  moduleId: number
  moduleName: string
  accessFlag: "ALLOWED" | "DENIED"
}

export interface OperatingUnitModel {
  operatingUnit: number
  operatingUnitName: string
}

export interface OrganizationModel {
  organizationId: number
  organizationCode: string
}

export interface OrgUnitLine {
  uarId: number
  operatingUnit: number
  operatingUnitName: string | null
  organizationId: number
  organizationCode: string | null
  limitValue: number
}

export interface UserAccessRightsModel {
  uarId: number
  userId: number
  userName: string | null
  accessChannel: "MOBILE" | "SYSTEM" | "BOTH"
  status: "ACTIVE" | "INACTIVE"
  remarks: string | null
  orgUnitsSelected: number
  totalOrgUnits: number
  orgUnits: OrgUnitLine[]
}

export interface ProcedureResult {
  success: boolean
  message: string
  newId?: number | null
  generatedCode?: string | null
}

export interface LoginResponse {
  token: string
  expiresAtUtc: string
}

export interface DecodedToken {
  sub?: string
  unique_name?: string
  role?: string
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string
  role_id?: string
  exp: number
  [key: string]: unknown
}
