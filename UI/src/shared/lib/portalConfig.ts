import {
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import type { ComponentType } from "react"

export type PortalRole = "admin" | "manager" | "user"
export type PortalNavItem = {
  label: string
  description: string
  path: string
  icon: ComponentType<{ className?: string }>
  roles: PortalRole[]
}

export const portalConfig = {
  brand: { name: "JANATICS", product: "Unified Suite", mark: Factory },
  login: {
    eyebrow: "Enterprise operations platform",
    title: "Unified control for every process.",
    description:
      "Connect production, supply chain, documentation, and people in one operating view.",
    heading: "Sign in to your workspace",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    remember: "Remember me",
    submit: "Sign in",
    submitting: "Signing in",
    forgot: "Forgot password?",
    footer: "Secure access to the Janatics operations portal",
    errors: {
      required: "Enter your username and password.",
      fallback: "Unable to sign in. Please try again.",
    },
  },
  shell: {
    navigation: "Workspace",
    overview: "Overview",
    collapse: "Collapse navigation",
    signOut: "Sign out",
    roleLabel: "Access profile",
    welcome: "Good to see you",
    dashboardTitle: "Operations overview",
    dashboardDescription: "Your role-based workspace is ready.",
    status: "Systems operational",
    cards: [
      {
        label: "Active workflows",
        value: "24",
        detail: "Across your workspace",
      },
      { label: "Open actions", value: "08", detail: "Need your attention" },
      { label: "Team members", value: "42", detail: "With portal access" },
    ],
    modulesTitle: "Available modules",
    modulesDescription: "Select a module to load its menus.",
    menusTitle: "Module menus",
    noMenus: "No menus are available for this module.",
    loading: "Loading workspace data",
    loadError: "Could not load workspace data.",
  },
  navigation: [
    {
      label: "Overview",
      description: "Workspace pulse",
      path: "/",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "user"],
    },
    {
      label: "Production",
      description: "Factory operations",
      path: "/production",
      icon: Factory,
      roles: ["admin", "manager"],
    },
    {
      label: "Supply chain",
      description: "Materials and vendors",
      path: "/supply-chain",
      icon: Boxes,
      roles: ["admin", "manager", "user"],
    },
    {
      label: "Reports",
      description: "Performance insights",
      path: "/reports",
      icon: BarChart3,
      roles: ["admin", "manager"],
    },
    {
      label: "People",
      description: "Users and teams",
      path: "/people",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "Controls",
      description: "Roles and permissions",
      path: "/controls",
      icon: ShieldCheck,
      roles: ["admin"],
    },
    {
      label: "Tasks",
      description: "Assigned work",
      path: "/tasks",
      icon: ClipboardList,
      roles: ["admin", "manager", "user"],
    },
    {
      label: "Settings",
      description: "Portal preferences",
      path: "/settings",
      icon: Settings,
      roles: ["admin", "manager", "user"],
    },
  ] satisfies PortalNavItem[],
} as const

export function getRole(value: unknown): PortalRole {
  const role = String(value ?? "user").toLowerCase()
  return role.includes("admin")
    ? "admin"
    : role.includes("manager")
      ? "manager"
      : "user"
}
