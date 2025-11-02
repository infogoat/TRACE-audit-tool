"use client"

import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Wrench,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ activeView, setActiveView, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "audit-results", label: "System Audit Results", icon: Shield },
    { id: "vulnerabilities", label: "Vulnerabilities & Threats", icon: AlertTriangle },
    { id: "remediation", label: "Auto-Remediation Tools", icon: Wrench },
    { id: "compliance", label: "Compliance Reports", icon: FileCheck },
    { id: "settings", label: "Settings & User Management", icon: Settings },
  ]

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[var(--color-bg-sidebar)] text-[var(--color-text-sidebar)] transition-all duration-300 ${collapsed ? "w-16" : "w-64"} shadow-lg`}
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-[var(--color-text-sidebar)] hover:bg-[var(--color-bg-sidebar-hover)]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveView(item.id)}
              className={`w-full justify-start mb-1 text-[var(--color-text-sidebar)] hover:bg-[var(--color-bg-sidebar-hover)] ${
                activeView === item.id ? "bg-[var(--color-bg-sidebar-active)] hover:bg-[var(--color-bg-sidebar-active-hover)]" : ""
              } ${collapsed ? "px-3" : "px-4"}`}
            >
              <Icon className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
