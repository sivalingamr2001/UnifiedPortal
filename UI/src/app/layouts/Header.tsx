import {
    Bell,
    Factory,
    Home,
    LockKeyhole,
    LogOut,
    MoonStar,
    PanelLeftOpen,
    PanelRightOpen,
    Search,
    Settings,
    ShieldCheck,
    SunMedium,
    UserRound,
} from "lucide-react"
import {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react"
import { useNavigate } from "react-router-dom"

import type { ThemeId, ThemeItem } from "@/app/context/ThemeContext"
import JANATICS_LOGO from "@/shared/lib/constants"

type HeaderProps = {
    searchOpen: boolean
    setSearchOpen: Dispatch<SetStateAction<boolean>>
    currentTheme: ThemeItem
    nextTheme: ThemeItem
    setTheme: (themeId: ThemeId) => void
    displayName: string
    userEmail: string
    sidebarOpen: boolean
    onToggleSidebar: () => void
    sidebarHint?: string | null
    logout: (reason?: "manual" | "expired" | "idle") => void
}

export function Header({
    searchOpen,
    setSearchOpen,
    currentTheme,
    nextTheme,
    setTheme,
    displayName,
    userEmail,
    sidebarOpen,
    onToggleSidebar,
    sidebarHint,
    logout,
}: HeaderProps) {
    const navigate = useNavigate()
    const searchRef = useRef<HTMLDivElement | null>(null)
    const profileMenuRef = useRef<HTMLDivElement | null>(null)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node

            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false)
            }

            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
                setProfileMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [setSearchOpen])

    return (
        <header className="sticky top-0 z-30 h-12 border-b border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))]/70 backdrop-blur-xl">
            {sidebarHint && (
                <div className="absolute right-3 top-12 z-50 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 shadow-lg">
                    {sidebarHint}
                </div>
            )}

            <div className="flex h-full w-full items-center gap-2 px-2 sm:gap-3 sm:px-3">
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[rgb(var(--color-muted))] transition-all duration-200 hover:border-[rgb(var(--color-line))] hover:bg-[rgb(var(--color-surface2))] hover:text-[rgb(var(--color-accent))]"
                        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarOpen ? (
                            <PanelRightOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftOpen className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2 rounded-md px-1 py-1 transition-all duration-200 hover:bg-[rgb(var(--color-surface2))]"
                    >
                        {/* Icon Container with relative positioning */}
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-sky-400 shadow-sm transition-transform duration-200 group-hover:scale-105">
                            {/* Default Factory Icon: Visible by default, hidden on group hover */}
                            <Factory className="h-3.5 w-3.5 text-white transition-opacity duration-200 group-hover:opacity-0" />

                            {/* Hover Home Icon: Absolute positioned, hidden by default, visible on group hover */}
                            <Home className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <img
                                src={JANATICS_LOGO}
                                alt="Janatics Logo"
                                className="h-3.5 w-auto"
                            />
                            <span className="mt-0.5 block text-[9px] font-medium tracking-[0.2em] text-slate-400 uppercase">
                                Unified Suite
                            </span>
                        </div>
                    </button>
                </div>

                <div className="flex flex-1 justify-center">
                    {searchOpen ? (
                        <div
                            ref={searchRef}
                            className="group flex h-8 w-full max-w-2xl items-center gap-2 rounded-md border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))]/70 px-3 text-xs text-[rgb(var(--color-muted))] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-md transition-all duration-200 focus-within:border-[rgb(var(--color-accent))] hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface2))]"
                        >
                            <Search className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-focus-within:text-[rgb(var(--color-accent))] group-hover:scale-110" />
                            <input
                                aria-label="Search portal"
                                className="w-full bg-transparent text-xs text-[rgb(var(--color-ink))] outline-none placeholder:text-[rgb(var(--color-muted))]"
                                placeholder="Search modules, documents, reports..."
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))]/50 text-[rgb(var(--color-muted))] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-md transition-all duration-200 hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface2))] hover:text-[rgb(var(--color-accent))]"
                            aria-label="Open search"
                        >
                            <Search className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 hover:scale-110" />
                        </button>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setTheme(nextTheme.id)}
                        className="group inline-flex h-8 items-center gap-1 rounded-md border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))]/60 px-2 text-[10px] font-medium text-[rgb(var(--color-ink))] backdrop-blur-md transition-all duration-200 hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface2))]"
                    >
                        {currentTheme.dark ? (
                            <MoonStar className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        ) : (
                            <SunMedium className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        )}

                        <span className="hidden sm:inline">{currentTheme.label}</span>
                    </button>

                    <button
                        type="button"
                        aria-label="Notifications"
                        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))]/60 text-[rgb(var(--color-muted))] backdrop-blur-md transition-all duration-200 hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface2))] hover:text-[rgb(var(--color-accent))]"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[rgb(var(--color-accent))] px-1 text-[8px] font-semibold text-white shadow-sm">
                            4
                        </span>
                    </button>

                    <div ref={profileMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen((open) => !open)}
                            className="flex h-8 items-center gap-2 rounded-md px-1 text-left transition-all duration-200 hover:bg-[rgb(var(--color-surface2))] sm:px-2"
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] text-[9px] font-semibold text-white shadow-sm">
                                {displayName
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </div>

                            <div className="hidden leading-tight sm:block">
                                <p className="text-[14px] font-semibold text-[rgb(var(--color-ink))]">
                                    {displayName}
                                </p>
                                <p className="text-[12px] text-[rgb(var(--color-muted))]">
                                    {userEmail}
                                </p>
                            </div>
                        </button>

                        {profileMenuOpen && (
                            <div className="absolute top-full right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] shadow-2xl shadow-slate-950/25">
                                <div className="flex items-center gap-3 border-b border-[rgb(var(--color-line))] p-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] text-sm font-semibold text-white">
                                        {displayName
                                            .split(" ")
                                            .map((part) => part[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[rgb(var(--color-ink))]">
                                            {displayName}
                                        </p>
                                        <p className="truncate text-xs text-[rgb(var(--color-muted))]">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 p-2">
                                    {[
                                        { label: "My Profile", icon: UserRound },
                                        { label: "Change Password", icon: LockKeyhole },
                                        { label: "Settings", icon: Settings },
                                        { label: "Notifications", icon: Bell },
                                        { label: "Security", icon: ShieldCheck },
                                    ].map(({ label, icon: Icon }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-[rgb(var(--color-ink))] transition hover:bg-[rgb(var(--color-surface2))]"
                                        >
                                            <Icon className="h-4 w-4 text-[rgb(var(--color-muted))]" />
                                            <span>{label}</span>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => logout("manual")}
                                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-red-500 transition hover:bg-red-500/5"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
