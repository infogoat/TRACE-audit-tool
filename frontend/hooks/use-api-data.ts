// hooks/use-api-data.ts

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
        const res = await fetch("http://localhost:8000/api/dashboard/overview")
        const backend = await res.json()

        const auditResults: AuditResult[] = backend.auditResults ?? []
        const vulnerabilities: Vulnerability[] = backend.vulnerabilities ?? []

        // ===========================
        // SECURITY SCORE LOGIC
        // ===========================
        const totalIssues =
          auditResults.length + vulnerabilities.length

        let score = 100

        if (totalIssues > 0) {
          score = Math.max(0, 100 - totalIssues * 10)
        }

        if (isNaN(score)) score = 100 // last fallback

        setData({
          auditResults: [],
          vulnerabilities: [],
          securityScore: backend.securityScore ?? 100,
          lastUpdated: new Date().toLocaleString(),
          notificationCount: backend.totalIssues ?? 0,
        })

      } catch (error) {
        console.error("Dashboard fetch failed:", error)

        // still return 100 score
        setData(EMPTY_DATA)
      }
    }

    fetchData()
  }, [])

  return data
}
