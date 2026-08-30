import { type ReactNode } from "react"
import { Navigate, Route, Routes, useParams } from "react-router-dom"

import { useAuth } from "@/app/context/AuthContext"
import { AppShell } from "@/app/layouts/app-shell"
import { ProtectedRoute } from "@/app/router/protected-route"
import { LoginPage } from "@/modules/auth/LoginPage"
import DashboardPage from "@/modules/dashboard/DashboardPage"

// Admin module components
import { AdminLayout } from "@/modules/admin/AdminLayout"
import { UserMasterPage } from "@/modules/admin/UserMasterPage"
import { RoleMasterPage } from "@/modules/admin/RoleMasterPage"
import { ModuleMasterPage } from "@/modules/admin/ModuleMasterPage"
import { MenuMasterPage } from "@/modules/admin/MenuMasterPage"
import { RoleVsModulePage } from "@/modules/admin/RoleVsModulePage"
import { RoleVsMenuPage } from "@/modules/admin/RoleVsMenuPage"
import { UserAccessRightsPage } from "@/modules/admin/UserAccessRightsPage"
import { UserHierarchyPage } from "@/modules/admin/UserHierarchyPage"

function MenuComingSoonPage() {
  const { menuSlug } = useParams()
  const label = menuSlug ? menuSlug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Menu"

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-lg rounded-2xl border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))] text-xl font-semibold text-[rgb(var(--color-accent))]">
          !
        </div>
        <h2 className="text-2xl font-semibold text-[rgb(var(--color-ink))]">{label}</h2>
        <p className="mt-3 text-base text-[rgb(var(--color-muted))]">
          {label} is currently in progress. Coming soon.
        </p>
      </div>
    </div>
  )
}

function ModuleRouteGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  const role = user.role?.toLowerCase()
  if (role !== "superadmin" && role !== "administrator" && role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Specific Admin layout and inner workspace pages */}
        <Route
          path="admin"
          element={
            <ModuleRouteGuard>
              <AdminLayout />
            </ModuleRouteGuard>
          }
        >
          <Route index element={<Navigate to="user-master" replace />} />
          <Route path="user-master" element={<UserMasterPage />} />
          <Route path="role-master" element={<RoleMasterPage />} />
          <Route path="module-master" element={<ModuleMasterPage />} />
          <Route path="menu-master" element={<MenuMasterPage />} />
          <Route path="role-vs-module" element={<RoleVsModulePage />} />
          <Route path="role-vs-menu" element={<RoleVsMenuPage />} />
          <Route path="user-access-rights" element={<UserAccessRightsPage />} />
          <Route path="user-hierarchy" element={<UserHierarchyPage />} />
        </Route>

        {/* Dynamic routes for other modules */}
        <Route path=":moduleSlug" element={<MenuComingSoonPage />} />
        <Route path=":moduleSlug/:menuSlug" element={<MenuComingSoonPage />} />

        <Route path="settings" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
