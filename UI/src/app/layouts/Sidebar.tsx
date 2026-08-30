import { ChevronDown, ChevronRight, X, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"

export type SidebarNavItem = {
  label: string
  to: string
  icon: LucideIcon
  children?: SidebarNavItem[]
}

type SidebarProps = {
  sidebarOpen: boolean
  onClose: () => void
  navigation?: SidebarNavItem[]
  moduleName?: string
}

export function Sidebar({
  sidebarOpen,
  onClose,
  navigation,
  moduleName = "Operations Suite",
}: SidebarProps) {
  const location = useLocation()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!navigation?.length) return

    const nextState: Record<string, boolean> = {}

    navigation.forEach((item) => {
      const isCurrent =
        item.to === "/"
          ? location.pathname === "/"
          : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

      const childActive = item.children?.some(
        (child) =>
          child.to === "/"
            ? location.pathname === "/"
            : location.pathname === child.to || location.pathname.startsWith(`${child.to}/`),
      )

      nextState[item.to] = Boolean(isCurrent || childActive)
    })

    setExpandedMap(nextState)
  }, [location.pathname, navigation])

  const toggleItem = (to: string) => {
    setExpandedMap((current) => ({
      ...current,
      [to]: !(current[to] ?? false),
    }))
  }

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-[rgb(var(--color-line))] bg-[rgb(var(--color-sidebar))] text-white shadow-xl transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "w-64 translate-x-0 opacity-100"
            : "w-0 -translate-x-full opacity-0 lg:w-0 lg:translate-x-0"
        }`}
      >
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="flex justify-end p-2 lg:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-3 py-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Workspace</span>
              </div>
              <p className="mt-1.5 text-base font-semibold">{moduleName}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigation?.map(({ label, to, icon: Icon, children }) => {
              const hasChildren = !!children?.length
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname === to || location.pathname.startsWith(`${to}/`)
              const expanded = expandedMap[to] ?? false

              const parentLink = (
                <div key={to + label} className="flex items-center gap-2">
                  <NavLink
                    to={to}
                    onClick={() => {
                      if (hasChildren) {
                        toggleItem(to)
                      }
                      if (window.innerWidth < 1024) onClose()
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-white/10 text-white shadow-inner shadow-white/5"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{label}</span>
                    {hasChildren && (
                      <span className="text-slate-400">
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                  </NavLink>
                </div>
              )

              if (!hasChildren) return parentLink

              return (
                <div key={to + label} className="space-y-1">
                  {parentLink}
                  {expanded && (
                    <div className="ml-4 space-y-1 border-l border-white/10 pl-2">
                      {children.map((child) => {
                        const childIsActive =
                          location.pathname === child.to ||
                          location.pathname.startsWith(`${child.to}/`)

                        return (
                          <NavLink
                            key={child.to + child.label}
                            to={child.to}
                            onClick={() => {
                              if (window.innerWidth < 1024) onClose()
                            }}
                            className={`flex items-center rounded-md px-2.5 py-1.5 text-sm transition ${
                              childIsActive
                                ? "bg-white/8 text-white"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
