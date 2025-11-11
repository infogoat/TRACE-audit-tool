// hooks/use-api-data.ts

import { useState, useEffect } from "react"
// Note: You must ensure all required Lucide icon components (like CheckCircle, Package, etc.) 
// are imported in the components/auto-remediation-tools.tsx file.

// =================================================================
// 1. INTERFACES (DEFINITIONS COPIED FROM YOUR ORIGINAL COMPONENTS)
// =================================================================

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
  icon: any // Placeholder for the Lucide component imported in the other file
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
  color: string // Tailwind classes e.g., 'text-green-600'
  bgColor: string // Tailwind classes e.g., 'bg-green-100'
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

// Global data structure for the entire application (FIXED)
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

    // ⚠️ CRITICAL FIXES FOR COMPONENTS/HEADER.TSX AND COMPONENTS/DASHBOARD-OVERVIEW.TSX
    lastUpdated: string;
    notificationCount: number;
}


// =================================================================
// 2. THE MAIN HOOK (INITIALIZED WITH DEFAULTS)
// =================================================================

const DEFAULT_SETTINGS: AppSettings = {
    companyName: "SecureCorpTech",
    timezone: "UTC-5",
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
    
    // ⚠️ CRITICAL FIXES INITIALIZED HERE
    lastUpdated: "Never (Client Data)", 
    notificationCount: 0,
}


/**
 * ⚠️ IMPORTANT:
 * This is the central hook you need to modify to connect to your backend API.
 * Currently, it returns empty/zeroed data.
 * Replace the useEffect content with your actual fetch/script logic.
 */
export function useDashboardData(): DashboardData {
    const [data, setData] = useState<DashboardData>(EMPTY_DATA)
    
    useEffect(() => {
        // --- YOUR BACKEND/SCRIPT FETCH LOGIC GOES HERE ---
        
        // Example: Fetch data from your backend
        // fetch('/api/dashboard')
        //     .then(res => res.json())
        //     .then(realTimeData => {
        //         setData(realTimeData); // This is where the real data replaces EMPTY_DATA
        //     })
        //     .catch(error => {
        //         console.error("Failed to fetch dashboard data:", error);
        //     });

        // Current placeholder (simulates fetching empty data)
        const simulateFetch = () => {
             // You can simulate an initial API response here if needed for testing
             setData(EMPTY_DATA);
        };

        const timer = setTimeout(simulateFetch, 500);

        return () => clearTimeout(timer);
    }, [])

    return data
}
