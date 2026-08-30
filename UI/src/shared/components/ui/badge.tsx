import React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none"
  
  const variants = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    destructive: "border-transparent bg-red-100 text-red-800 border-red-200",
    outline: "text-slate-900 border-slate-200 bg-white",
    success: "border-transparent bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "border-transparent bg-amber-100 text-amber-800 border-amber-200",
  }

  const combinedClass = `${baseStyles} ${variants[variant]} ${className}`

  return <div className={combinedClass} {...props} />
}
