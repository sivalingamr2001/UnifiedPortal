import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Factory,
  LayoutDashboard,
  CircleAlert,
  ChartColumn,
  Users,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate("/", { replace: true })
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 max-lg:h-auto max-lg:min-h-screen max-lg:overflow-y-auto">
      {/* Left panel: Info & brand */}
      <div
        className="relative hidden w-[52%] flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{
          background:
            "linear-gradient(145deg, rgb(10, 31, 68) 0%, rgb(15, 42, 82) 40%, rgb(26, 58, 107) 70%, rgb(26, 95, 214) 100%)",
        }}
      >
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgb(14, 165, 233) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgb(26, 95, 214) 0%, transparent 70%)",
            }}
          />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
            <Factory className="h-5 w-5 text-white" />
          </div>
          <div>
            <div
              className="text-4xl font-extrabold tracking-tight text-blue-400"
              style={{ letterSpacing: "-0.02em" }}
            >
              JANATICS
            </div>
            <div className="mt-1 text-xs tracking-widest text-blue-200 uppercase">
              Unified Suite
            </div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-blue-200">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            All systems operational
          </div>
          <h1
            className="mb-4 text-4xl leading-tight font-bold text-white xl:text-5xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Unified Control
            <br />
            <span className="text-blue-400">for Every Process.</span>
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-blue-200">
            One platform connecting production, supply chain, documentation, and
            people — in real time.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <LayoutDashboard className="h-3.5 w-3.5 opacity-80" /> Dashboards
            </span>
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <CircleAlert className="h-3.5 w-3.5 opacity-80" /> Alerts
            </span>
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <ChartColumn className="h-3.5 w-3.5 opacity-80" /> KPIs
            </span>
          </div>
        </div>

        {/* Bottom Footer Statistics */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div>
            <div className="text-2xl font-bold text-white">8</div>
            <div className="mt-0.5 text-xs text-blue-300">Modules</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">10+</div>
            <div className="mt-0.5 text-xs text-blue-300">Dashboards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="mt-0.5 text-xs text-blue-300">Real-time Sync</div>
          </div>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 lg:p-16">
        {/* Mobile Header (Brand block) */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Factory className="h-5 w-5 text-white" />
          </div>
          <div>
            <div
              className="text-3xl font-extrabold text-blue-600"
              style={{ letterSpacing: "-0.02em" }}
            >
              JANATICS
            </div>
            <div className="mt-0.5 text-xs tracking-widest text-slate-400 uppercase">
              Unified Suite
            </div>
          </div>
        </div>

        {/* Card Frame */}
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2
              className="mb-1 text-2xl font-bold text-slate-900"
              style={{ letterSpacing: "-0.01em" }}
            >
              Janatics Unified Login
            </h2>
            <p className="text-sm text-slate-500">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Username
              </label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter username (e.g. admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-slate-500 select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-semibold text-blue-600 transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_4px_14px_rgba(26,95,214,0.4)] disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-12 text-xs text-slate-400">
          &copy; 2026 EnterpriseOS &middot; v4.2.1 &middot;{" "}
          <span className="cursor-pointer hover:text-slate-600">Privacy</span>{" "}
          &middot;{" "}
          <span className="cursor-pointer hover:text-slate-600">Terms</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
