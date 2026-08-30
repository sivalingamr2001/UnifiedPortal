import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value: string
  onValueChange: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  selectedValueLabel: string
  setSelectedValueLabel: (label: string) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

export function Select({
  children,
  value = "",
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selectedValueLabel, setSelectedValueLabel] = useState("")

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: (val) => {
          onValueChange?.(val)
          setOpen(false)
        },
        open,
        setOpen,
        selectedValueLabel,
        setSelectedValueLabel,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ctx = useContext(SelectContext)
  if (!ctx) return null
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ctx.open && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        ctx.setOpen(false)
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ctx.open]);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer ${className}`}
    >
      <div className="truncate flex-1 text-left">{children}</div>
      <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
    </button>
  )
}

export function SelectValue({ placeholder = "" }: { placeholder?: string }) {
  const ctx = useContext(SelectContext)
  if (!ctx) return null
  return <span>{ctx.selectedValueLabel || placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(SelectContext)
  if (!ctx) return null
  if (!ctx.open) return null

  return (
    <div className="absolute left-0 mt-1 z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
      {children}
    </div>
  )
}

export function SelectItem({
  children,
  value,
}: {
  children: string | React.ReactNode
  value: string
}) {
  const ctx = useContext(SelectContext)
  if (!ctx) return null
  const isSelected = ctx.value === value

  const textLabel = typeof children === "string" ? children : ""

  useEffect(() => {
    if (isSelected && textLabel) {
      ctx.setSelectedValueLabel(textLabel)
    }
  }, [isSelected, textLabel])

  return (
    <button
      type="button"
      onClick={() => {
        ctx.onValueChange(value)
        if (textLabel) {
          ctx.setSelectedValueLabel(textLabel)
        }
      }}
      className={`flex w-full items-center px-3 py-2 text-sm text-left hover:bg-slate-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
      }`}
    >
      {children}
    </button>
  )
}
