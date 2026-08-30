import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface Props {
  points: [number, number, number]
  label: string
  dir: "up" | "down" | "flat"
}

export const TrendSpark = ({ points, label, dir }: Props) => {
  const color =
    dir === "up" ? "#10b981" : dir === "down" ? "#ef4444" : "#94a3b8"
  const textColor =
    dir === "up"
      ? "text-emerald-700"
      : dir === "down"
        ? "text-red-500"
        : "text-slate-400"
  const Icon =
    dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus

  return (
    <div className="flex items-center justify-center gap-1.5">
      <svg width="52" height="18" viewBox="0 0 52 18">
        <polyline
          points={`0,${points[0]} 24,${points[1]} 48,${points[2]}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="48" cy={points[2]} r="2.5" fill={color} />
      </svg>
      <span
        className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${textColor}`}
      >
        <Icon className="h-2 w-2" />
        {label}
      </span>
    </div>
  )
}
