import { useEffect, useState } from "react"

export const AppFooter = () => {
  const [timeText, setTimeText] = useState("")
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0"

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()

      const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      const fullDateStr = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })

      setTimeText(`JANATICS · ${monthYear} · ${fullDateStr} · ${timeStr}`)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <footer>
      <div className="flex shrink-0 items-center gap-5 border-t border-slate-200 bg-white px-4 py-1.5 text-[10px] text-slate-400">
        {/* Displays the version on the left side of the footer */}
        <div className="text-slate-400 font-medium">
          v{appVersion}
        </div>
        <div className="ml-auto text-slate-300 tracking-wide tabular-nums">
          {timeText}
        </div>
      </div>
    </footer>
  )
}
