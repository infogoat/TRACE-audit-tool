"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { AuditResults } from "@/components/audit-results"
import { VulnerabilitiesThreats } from "@/components/vulnerabilities-threats"
import { AutoRemediationTools } from "@/components/auto-remediation-tools"
import { ComplianceReports } from "@/components/compliance-reports"
import { SettingsUserManagement } from "@/components/settings-user-management"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeView) {
      case "audit-results":
        return <AuditResults />
      case "vulnerabilities":
        return <VulnerabilitiesThreats />
      case "remediation":
        return <AutoRemediationTools />
      case "compliance":
        return <ComplianceReports />
      case "settings":
        return <SettingsUserManagement />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
