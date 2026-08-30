import Logo from "@/lib/utils"
import { Zap, Clock, UsersRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Outlet } from "react-router-dom"

export const AuthLayout = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)

  useEffect(() => {
    const headerEl = headerRef.current
    const footerEl = footerRef.current

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const boxSize = entry.contentBoxSize?.[0]
        const height = boxSize
          ? boxSize.blockSize
          : entry.target.getBoundingClientRect().height

        if (entry.target === headerEl) setHeaderHeight(height)
        if (entry.target === footerEl) setFooterHeight(height)
      }
    })

    if (headerEl) observer.observe(headerEl)
    if (footerEl) observer.observe(footerEl)

    return () => observer.disconnect()
  }, [])

  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/,/g, "")

  const parts = formattedDate.split(" ")
  const displayDate = `${parts[0]}, ${parts[2]} ${parts[1]}, ${parts[3]}`

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground antialiased">
      {/* Header */}
      <header
        ref={headerRef}
        className="w-full shrink-0 border-b border-border/40"
      >
        <div className="flex h-14 w-full items-center justify-between bg-background px-4 shadow-md select-none">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-blue-500 shadow-md">
              <Zap size={16} className="text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-2xl leading-tight font-black tracking-tight">
                <img
                  src={Logo}
                  alt="JANATICS"
                  className="h-3.5 w-auto animate-in object-contain object-left duration-300 fade-in"
                />
              </div>
              <div className="text-[9px] leading-tight font-semibold tracking-[0.22em] text-blue-400 uppercase">
                PES Lite · Planning &amp; Execution System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground/80 shadow-inner">
              <Clock className="size-3.5 text-muted-foreground/60" />
              <span>{displayDate}</span>
            </div>

            <div className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#1e73be] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#165a96]">
              <UsersRound className="size-3.5 stroke-[2.5]" />
              <span>Marketing Ops</span>
            </div>
          </div>
        </div>
      </header>

      {/* Login Center Content Workspace */}
      <main
        className="flex w-full items-center justify-center overflow-hidden bg-[#f8fafc] px-4"
        style={{
          height: `calc(100vh - ${headerHeight}px - ${footerHeight}px)`,
        }}
      >
        <div className="w-full max-w-md animate-in duration-500 fade-in slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="w-full shrink-0 border-t border-border/40 bg-background px-4 py-2.5 text-xs font-medium text-muted-foreground"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between tracking-tight">
          <div>
            <span className="text-[0.6rem] font-medium tracking-wider text-black">
              JANATICS PES Lite v{import.meta.env.VITE_APP_VERSION} &middot;
              Manufacturing Planning Platform
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[0.6rem] font-medium tracking-wider text-muted-foreground">
                All systems operational
              </span>
            </div>
            <span className="text-[0.6rem] font-medium tracking-normal text-muted-foreground">
              &copy; {new Date().getFullYear()} Janatics India Pvt Ltd
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
