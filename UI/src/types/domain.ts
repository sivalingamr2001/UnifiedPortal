export interface User {
  id: number
  code: string
  name: string
  login: string
  email: string
  mobile: string
  role: string
  type: string
  sec: number
  reportsTo: string
  validFrom: string
  validTo: string
  status: "Active" | "Inactive"
}

export interface Role {
  id: number
  code: string
  name: string
  status: "Active" | "Inactive"
}

export interface Module {
  id: number
  code: string
  name: string
  description: string
  status: "Active" | "Inactive"
}

export interface MenuItem {
  id: number
  code: string
  menuName: string
  displayName: string
  module: string
  parent: string
  type: string
  nature: string
  sort: number
  status: "Active" | "Inactive"
}

export interface RoleModuleMapping {
  roleName: string
  moduleName: string
  hasAccess: boolean
}

export interface RoleMenuMapping {
  roleName: string
  menuCode: string
  hasAccess: boolean
}

export interface UserAccessRight {
  username: string
  moduleName: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface PortalMessage {
  id: number
  portalCode: string
  portalText: string
}
