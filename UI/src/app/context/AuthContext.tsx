import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { jwtDecode } from "jwt-decode"
import type { DecodedToken } from "../../types/models"
import { tokenStore } from "@/shared/lib/tokenStore"
import { setUnauthorizedHandler } from "@/shared/lib/apiClient"
import { authApi } from "@/services/authApi"

interface CurrentUser {
  userId: number
  userName: string
  role: string
}

interface AuthContextValue {
  user: CurrentUser | null
  isAuthenticated: boolean
  login: (userName: string, password: string) => Promise<boolean>
  logout: (reason?: "manual" | "expired" | "idle") => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const IDLE_TIMEOUT_MINUTES = 15

function decodeUser(token: string): CurrentUser | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    if (decoded.exp * 1000 < Date.now()) return null

    const role =
      decoded.role ??
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "User"

    return {
      userId: decoded.sub ? parseInt(decoded.sub, 10) : 0,
      userName: (decoded.unique_name as string) ?? "",
      role: String(role),
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const token = tokenStore.get()
    return token ? decodeUser(token) : null
  })
  const [logoutReason, setLogoutReason] = useState<
    "manual" | "expired" | "idle" | null
  >(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logout = (reason: "manual" | "expired" | "idle" = "manual") => {
    tokenStore.clear()
    setUser(null)
    setLogoutReason(reason)
  }

  useEffect(() => {
    setUnauthorizedHandler(() => logout("expired"))
  }, [])

  const login = async (
    userName: string,
    password: string
  ): Promise<boolean> => {
    const response = await authApi.login(userName, password)
    const decodedUser = decodeUser(response.token)

    if (!decodedUser) {
      return false
    }

    tokenStore.set(response.token)
    setUser(decodedUser)
    setLogoutReason(null)
    return true
  }

  useEffect(() => {
    if (!user) return
    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(
        () => logout("idle"),
        IDLE_TIMEOUT_MINUTES * 60 * 1000
      )
    }
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ]
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    )
    resetTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [user?.userId])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      {logoutReason && logoutReason !== "manual" && (
        <div className="bg-ink fixed bottom-4 left-1/2 z-90 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg">
          {logoutReason === "idle"
            ? "You were signed out after 15 minutes of inactivity."
            : "Your session ended. Please sign in again."}
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
