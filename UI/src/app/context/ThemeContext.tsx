import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export const THEMES = [
  { id: "aurora", label: "Aurora", dark: false },
  { id: "obsidian", label: "Obsidian", dark: true },
  { id: "emerald", label: "Emerald", dark: false },
  { id: "prestige", label: "Prestige", dark: false },
  { id: "sterling", label: "Sterling", dark: false },
  { id: "nightfall", label: "Nightfall", dark: true },
] as const

export type ThemeItem = (typeof THEMES)[number]
export type ThemeId = ThemeItem["id"]
const STORAGE_KEY = "janatics-theme"
const DEFAULT_THEME: ThemeId = "aurora"

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function isValidTheme(value: string | null): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isValidTheme(stored) ? stored : DEFAULT_THEME
  })

  useEffect(() => {
    if (theme === "aurora") {
      document.documentElement.removeAttribute("data-theme") // aurora is the :root default, no override needed
    } else {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme])

  function setTheme(next: ThemeId) {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
