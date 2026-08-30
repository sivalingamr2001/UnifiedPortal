import { useAuth } from "@/app/context/AuthContext"
import { THEMES, useTheme } from "@/app/context/ThemeContext"
import type { MenuModel } from "@/types/models"
import { useEffect, useState } from "react"

import { LayoutGrid } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar, type SidebarNavItem } from "./Sidebar"

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildSidebarNavigation(
  moduleName: string,
  menus: MenuModel[],
): SidebarNavItem[] {
  const moduleSlug = toSlug(moduleName)
  const byParent = new Map<number | null, MenuModel[]>()

  menus.forEach((menu) => {
    const parentKey = menu.parentMenuId ?? null
    const existing = byParent.get(parentKey) ?? []
    existing.push(menu)
    byParent.set(parentKey, existing)
  })

  const sortMenus = (items: MenuModel[]) =>
    [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const buildTree = (parentId: number | null): SidebarNavItem[] =>
    sortMenus(byParent.get(parentId) ?? [])
      .map((menu) => {
        const label = menu.displayName || menu.menuName || "Menu"
        const slug = toSlug(label)
        const children = buildTree(menu.menuId)

        return {
          label,
          to: moduleSlug ? `/${moduleSlug}/${slug}` : `/${slug}`,
          icon: LayoutGrid,
          ...(children.length > 0 ? { children } : {}),
        }
      })
      .filter(Boolean)

  return buildTree(null)
}

function findDefaultMenuRoute(
  navigation: SidebarNavItem[],
  defaultMenu: string | null,
): string | null {
  if (!defaultMenu) return null

  const target = defaultMenu.trim()
  if (!target) return null

  const match = (label: string) =>
    label.trim().toLowerCase() === target.toLowerCase() ||
    toSlug(label) === toSlug(target)

  const walk = (items: SidebarNavItem[]): string | null => {
    for (const item of items) {
      if (match(item.label)) return item.to
      if (item.children?.length) {
        const childMatch = walk(item.children)
        if (childMatch) return childMatch
      }
    }
    return null
  }

  return walk(navigation)
}

export function AppShell() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHint, setSidebarHint] = useState<string | null>(null)
  const [moduleName, setModuleName] = useState("Operations Suite")
  const [navigation, setNavigation] = useState<SidebarNavItem[]>([])
  const isRootDashboard = location.pathname === "/" || location.pathname === "" || location.pathname === "/unified-portal/" || location.pathname === "/unified-portal"

  useEffect(() => {
    if (!sidebarHint) return

    const timeoutId = window.setTimeout(() => setSidebarHint(null), 2400)
    return () => window.clearTimeout(timeoutId)
  }, [sidebarHint])

  useEffect(() => {
    const handleModuleMenus = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          menus?: MenuModel[]
          moduleName?: string
          defaultMenu?: string | null
          source?: "user" | "auto"
        }>
      ).detail
      if (!detail?.menus) return

      const nextModuleName = detail.moduleName ?? "Operations Suite"
      setModuleName(nextModuleName)
      const nextNavigation = buildSidebarNavigation(nextModuleName, detail.menus)
      setNavigation(nextNavigation)

      const isRootDashboard =
        location.pathname === "/" ||
        location.pathname === "" ||
        location.pathname === "/unified-portal/" ||
        location.pathname === "/unified-portal"

      const defaultRoute = findDefaultMenuRoute(nextNavigation, detail.defaultMenu ?? null)
      if (detail.source === "auto" && isRootDashboard) {
        setSidebarOpen(true)
        return
      }

      if (defaultRoute) {
        navigate(defaultRoute, { replace: true })
      }

      setSidebarOpen(true)
    }

    window.addEventListener("portal:module-menus", handleModuleMenus)
    return () => {
      window.removeEventListener("portal:module-menus", handleModuleMenus)
    }
  }, [navigate])

  const currentTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0]
  const nextTheme =
    THEMES[(THEMES.findIndex((item) => item.id === theme) + 1) % THEMES.length]

  const displayName = user?.userName ?? "John Carter"
  const userEmail = user && typeof user.userName === "string"
    ? `${user.userName.toLowerCase().replace(/\s+/g, ".")}@janatics.com`
    : "john.carter@janatics.com"

  const handleSidebarToggle = () => {
    if (!navigation.length) {
      setSidebarHint("Please select a module to access the menu.")
      return
    }

    setSidebarOpen((value) => !value)
  }

  return (
    <div className="h-screen overflow-hidden bg-[rgb(var(--color-bg))] text-[rgb(var(--color-ink))]">
      <Header
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        currentTheme={currentTheme}
        nextTheme={nextTheme}
        setTheme={setTheme}
        displayName={displayName}
        userEmail={userEmail}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleSidebarToggle}
        sidebarHint={sidebarHint}
        logout={logout}
      />

      <div className="flex h-[calc(100vh-48px)] overflow-hidden">
        {!isRootDashboard && (
          <Sidebar
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            navigation={navigation}
            moduleName={moduleName}
          />
        )}

        <main className={`flex-1 bg-[rgb(var(--color-bg))] p-4 ${isRootDashboard ? "" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
