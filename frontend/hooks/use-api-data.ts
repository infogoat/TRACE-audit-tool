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
  detectedOn: string
  suggestedFix: string
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

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetching data from the backend container/localhost
        const res = await fetch("http://localhost:8000/api/dashboard/overview")
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const backend = await res.json()

        // Correctly mapping backend response fields to the frontend state
        setData({
          auditResults: backend.auditResults ?? [],
          vulnerabilities: backend.vulnerabilities ?? [],
          securityScore: backend.securityScore ?? 20.95,
          lastUpdated: new Date().toLocaleString(),
          notificationCount: backend.totalIssues ?? 0,
        })

      } catch (error) {
        console.error("Dashboard fetch failed:", error)
        // Reverting to empty state on failure
        setData(EMPTY_DATA)
      }
    }

    fetchData()
  }, [])

  return data
}