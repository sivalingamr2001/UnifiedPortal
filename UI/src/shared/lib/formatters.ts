import type { ModuleModel, MenuModel, ModuleAccessModel } from "@/types/models"

/**
 * Recursively converts an object's keys from SNAKE_CASE to camelCase.
 * It handles arrays, primitives, and nested child items automatically.
 */
const toCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);

    return Object.keys(obj).reduce((result, key) => {
        // Convert KEY_NAME to keyName
        const camelKey = key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        let value = obj[key];
        // Ensure numbers looking like strings or specific types get passed properly
        if (value && typeof value === "object") {
            value = toCamelCase(value);
        }

        return { ...result, [camelKey]: value };
    }, {} as any);
};

/**
 * Standard utility wrapper to ensure the output is always an array of converted elements.
 */
const dynamicNormalize = <T>(data: unknown): T[] => {
    if (!data) return [];

    // Check if the payload is wrapped in a standard DB response envelope like { data: [...] }
    let rawData = data;
    if (typeof data === "object" && data !== null && "data" in data) {
        rawData = (data as any).data;
    }

    const converted = toCamelCase(rawData);
    return Array.isArray(converted) ? (converted as T[]) : [converted as T];
};

// Dynamic mapping implementations
export const normalizeModules = (data: unknown): ModuleModel[] => dynamicNormalize<ModuleModel>(data);

export const normalizeMenus = (data: unknown): MenuModel[] => dynamicNormalize<MenuModel>(data);

export const normalizeModuleAccess = (data: unknown): ModuleAccessModel[] => dynamicNormalize<ModuleAccessModel>(data);
