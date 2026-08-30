import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/app/context/AuthContext"

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedUserRole = user?.role?.toLowerCase() ?? ""
    const hasAccess = allowedRoles.some(
      (role) => role.toLowerCase() === normalizedUserRole
    )

    if (!hasAccess) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
