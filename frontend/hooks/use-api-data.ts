// frontend/hooks/use-api-data.ts

import { useEffect, useState } from "react"

// =======================
// INTERFACES
// =======================

export interface AuditResult {
  id: string
  severity: "Critical" | "High" | "Medium" | "Low"
  category: string
  description: string
  system: string
}

export interface Vulnerability {
  id: string
  severity: "Critical" | "High" | "Medium" | "Low"
  category: string
  description: string
  system: string
  dateDetected: string
  status: "Open" | "In Progress" | "Resolved"
}

export interface DashboardData {
  auditResults: AuditResult[]
  vulnerabilities: Vulnerability[]
  securityScore: number
  lastUpdated: string
  notificationCount: number
}

// =======================
// DEFAULT EMPTY STATE
// =======================

const EMPTY_DATA: DashboardData = {
  auditResults: [],
  vulnerabilities: [],
  securityScore: 100,
  lastUpdated: "Not updated",
  notificationCount: 0,
}

// =======================
// MAIN HOOK
// =======================
// frontend/hooks/use-api-data.ts (Updated Logic)

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString())
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Overview (Score, Total Issues)
        const overviewRes = await fetch("http://localhost:8000/api/dashboard/overview")
        const overview = await overviewRes.json()

        // 2. Fetch Detailed Vulnerabilities (The simulated library findings)
        const vulnsRes = await fetch("http://localhost:8000/api/vulnerabilities")
        const vulnerabilities = await vulnsRes.json()

        setData({
          securityScore: overview.securityScore ?? 0,
          notificationCount: overview.totalIssues ?? 0,
          lastUpdated,
          // Use the actual simulated vulnerabilities from the backend library
          vulnerabilities: vulnerabilities.map((v: any) => ({
            ...v,
            dateDetected: new Date().toISOString(),
          })),
          // Map the same vulnerabilities to Audit Results for consistency
          auditResults: vulnerabilities.map((v: any) => ({
            id: `AUDIT-${v.id}`,
            severity: v.severity,
            category: v.category,
            description: v.description,
            system: v.system
          }))
        })
      } catch (error) {
        console.error("Dashboard fetch failed:", error)
        setData(EMPTY_DATA)
      }
    }

    if (lastUpdated) fetchData()
  }, [lastUpdated])

  return data
}