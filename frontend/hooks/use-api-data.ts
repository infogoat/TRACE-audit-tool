// hooks/use-api-data.ts
import { useState, useEffect } from "react"

// --- (keep your interfaces exactly as they are) ---
export interface AuditResult {
  id: string
  severity: "Critical" | "High" | "Medium" | "Low"
  category: string
  description: string
  detectedOn: string
  suggestedFix: string
  system: string
}

export interface ScanActivity {
  id: number
  system: string
  date: string
  status: "Completed" | "In Progress" | "Failed"
  issues: number
  severity: "Critical" | "High" | "Medium" | "Low" | "None"
}

export interface Vulnerability {
  id: string
  severity: "Critical" | "High" | "Medium" | "Low"
  category: "Configuration" | "Patch" | "Permissions" | string
  system: string
  description: string
  dateDetected: string
  status: "Open" | "In Progress" | "Resolved" | string
}

export interface RecentThreat {
  name: string
  severity: "Critical" | "High" | "Medium" | "Low"
  time: string
}

export interface RemediationTool {
  id: number
  name: string
  description: string
  icon: any
  category: string
  lastRun: string
  status: "ready" | "running" | "scheduled" | string
}

export interface RemediationRecord {
  toolName: string
  dateRun: string
  issuesFixed: number
  status: "Success" | "Failed" | string
  duration: string
}

export interface ComplianceScore {
  framework: string
  score: number
  color: string
  bgColor: string
}

export interface ComplianceReport {
  id: number
  name: string
  framework: string
  dateGenerated: string
  score: number
  status: string
}

export interface TrendDataItem {
  month: string
  "PCI-DSS": number
  HIPAA: number
  ISO27001: number
  SOX: number
}

export interface Recommendation {
  framework: string
  priority: "High" | "Medium" | "Low"
  recommendation: string
  impact: string
}

export interface User {
  id: number
  username: string
  email: string
  role: "Admin" | "Security Analyst" | "Auditor" | string
  status: "Active" | "Inactive" | string
  lastLogin: string
}

export interface AppSettings {
  companyName: string
  timezone: string
  emailNotifications: boolean
  slackNotifications: boolean
  smsNotifications: boolean
  twoFactorAuth: boolean
  passwordMinLength: number
  passwordComplexity: boolean
  sessionTimeout: number
}

export interface DashboardData {
  auditResults: AuditResult[]
  recentScans: ScanActivity[]
  vulnerabilities: Vulnerability[]
  recentThreats: RecentThreat[]
  securityScore: number
  securityTrendData: { month: string; score: number }[]
  issueDistributionData: { category: string; count: number; color: string }[]
  remediationTools: RemediationTool[]
  remediationHistory: RemediationRecord[]
  complianceScores: ComplianceScore[]
  complianceReports: ComplianceReport[]
  complianceTrendData: TrendDataItem[]
  complianceRecommendations: Recommendation[]
  users: User[]
  appSettings: AppSettings
  lastUpdated: string
  notificationCount: number
}

// --- Default empty structures ---
const DEFAULT_SETTINGS: AppSettings = {
  companyName: "TRACE Systems",
  timezone: "UTC+5:30",
  emailNotifications: false,
  slackNotifications: false,
  smsNotifications: false,
  twoFactorAuth: false,
  passwordMinLength: 8,
  passwordComplexity: false,
  sessionTimeout: 30,
}

const EMPTY_DATA: DashboardData = {
  auditResults: [],
  recentScans: [],
  vulnerabilities: [],
  recentThreats: [],
  securityScore: 0,
  securityTrendData: [],
  issueDistributionData: [],
  remediationTools: [],
  remediationHistory: [],
  complianceScores: [],
  complianceReports: [],
  complianceTrendData: [],
  complianceRecommendations: [],
  users: [],
  appSettings: DEFAULT_SETTINGS,
  lastUpdated: "Never (Client Data)",
  notificationCount: 0,
}

// ---  LIVE BACKEND FETCH LOGIC ---
export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)

  useEffect(() => {
    const API_URL = "http://localhost:8000/api/results" // change if needed

    const fetchBackendData = async () => {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const apiResults = await res.json()

        // Map backend results into frontend structure
        const mapped: DashboardData = {
          ...EMPTY_DATA,
          auditResults: apiResults.map((r: any, index: number) => ({
          id: String(index + 1),
          severity:
          r.score >= 80
          ? "Low"
          : r.score >= 50
          ? "Medium"
          : "Critical",
      category: "Configuration",
      description: `System ${r.agent} compliance audit result`,
      system: r.agent,
      detectedOn: r.timestamp,
      suggestedFix:
        r.score < 50
          ? "Apply all pending security patches"
          : r.score < 80
          ? "Review medium-risk CIS policies"
          : "Compliant",
          })),
          
          recentScans: apiResults.map((r: any, index: number) => ({
            id: index + 1,
            system: r.agent,
            date: r.timestamp,
            status: "Completed",
            issues: r.failed,
            severity:
              r.score >= 80
                ? "Low"
                : r.score >= 50
                ? "Medium"
                : "Critical",
          })),

          vulnerabilities: apiResults.map((r: any, index: number) => ({
            id: String(index + 1),
            severity:
              r.score >= 80
                ? "Low"
                : r.score >= 50
                ? "Medium"
                : "Critical",
            category: "Configuration",
            system: r.agent,
            description: `System ${r.agent} compliance check`,
            dateDetected: r.timestamp,
            status: "Open",
          })),
          securityScore:
            apiResults.length > 0
              ? Math.round(
                  apiResults.reduce((sum: number, r: any) => sum + r.score, 0) /
                    apiResults.length
                )
              : 0,
          issueDistributionData: [
            { category: "Critical", count: apiResults.filter((r: any) => r.score < 50).length, color: "#DC2626" },
            { category: "Medium", count: apiResults.filter((r: any) => r.score >= 50 && r.score < 80).length, color: "#FACC15" },
            { category: "Low", count: apiResults.filter((r: any) => r.score >= 80).length, color: "#16A34A" },
          ],
          lastUpdated: new Date().toLocaleString(),
        }

        setData(mapped)
      } catch (err) {
        console.error("Failed to fetch backend data:", err)
        setData(EMPTY_DATA)
      }
    }

    fetchBackendData()
    const interval = setInterval(fetchBackendData, 30000)
    return () => clearInterval(interval)
  }, [])

  return data
}
