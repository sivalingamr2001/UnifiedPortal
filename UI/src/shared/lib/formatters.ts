import type { ModuleModel, MenuModel, ModuleAccessModel } from "@/types/models"

export const normalizeModules = (data: unknown): ModuleModel[] => {
    if (Array.isArray(data)) return data as ModuleModel[]
    if (data && typeof data === "object") return [data as ModuleModel]
    return []
}

export const normalizeMenus = (data: unknown): MenuModel[] => {
    if (Array.isArray(data)) return data as MenuModel[]
    if (data && typeof data === "object") return [data as MenuModel]
    return []
}

export const normalizeModuleAccess = (data: unknown): ModuleAccessModel[] => {
    if (Array.isArray(data)) return data as ModuleAccessModel[]
    if (data && typeof data === "object") return [data as ModuleAccessModel]
    return []
}