import JANATICS_LOGO from "@/shared/assets/jana.png"
import type { MenuModel } from "@/types/models"

export default JANATICS_LOGO

export type NavItem = {
    name: string
    path: string
    iconName: string
}

export type NavSection = {
    title: string
    items: NavItem[]
}

export const MODULE_NAV_CONFIG: Record<string, NavSection[]> = {
    admin: [
        {
            title: "Main",
            items: [{ name: "Overview", path: "/admin", iconName: "Layers" }],
        },
        {
            title: "Masters",
            items: [
                { name: "User Master", path: "/admin/user-master", iconName: "Users" },
                { name: "Role Master", path: "/admin/role-master", iconName: "Shield" },
                { name: "Module Master", path: "/admin/module-master", iconName: "Layers" },
                { name: "Menu Master", path: "/admin/menu-master", iconName: "Menu" },
            ],
        },
        {
            title: "Mappings",
            items: [
                { name: "Role vs Module", path: "/admin/role-module", iconName: "Link2" },
                { name: "Role vs Menu", path: "/admin/role-menu", iconName: "Link2" },
            ],
        },
        {
            title: "Security",
            items: [
                { name: "User Access Rights", path: "/admin/user-access-rights", iconName: "Key" },
                { name: "User Hierarchy", path: "/admin/user-hierarchy", iconName: "GitBranch" },
            ],
        },
    ],
}

export const getModuleMenuConfig = (moduleKey: string): { menus: MenuModel[]; defaultMenu: string | null } => {
    const normalizedKey = moduleKey.trim().toLowerCase()
    const sections = MODULE_NAV_CONFIG[normalizedKey] ?? []

    const menus: MenuModel[] = sections.flatMap((section, sectionIndex) =>
        section.items.map((item, itemIndex) => ({
            menuId: sectionIndex * 100 + itemIndex + 1,
            menuCode: item.path.split("/").filter(Boolean).at(-1) ?? item.name,
            menuName: item.name,
            displayName: item.name,
            moduleId: 0,
            moduleName: normalizedKey,
            parentMenuId: null,
            menuType: "MASTER",
            nature: "FORM",
            sortOrder: sectionIndex * 100 + itemIndex + 1,
            status: "ACTIVE",
        })),
    )

    const defaultMenu = sections[0]?.items[0]?.name ?? null

    return { menus, defaultMenu }
}