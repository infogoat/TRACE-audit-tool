// components/vulnerabilities-threats.tsx (MODIFIED)

"use client"

import { useState } from "react"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Search, Calendar, AlertTriangle, Shield, Settings, Key
} from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function VulnerabilitiesThreats() {
  const { vulnerabilities, recentThreats } = useDashboardData()

  // SAFE ARRAYS (CRITICAL FIX)
  const vulns = vulnerabilities ?? []
  const threats = recentThreats ?? []

  const [severityFilter, setSeverityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // ---------------- HELPERS ----------------

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // ---------------- FILTERING ----------------

  const filteredVulnerabilities = vulns.filter(v => {
    const matchesSeverity =
      severityFilter === "all" ||
      v.severity?.toLowerCase() === severityFilter

    const matchesCategory =
      categoryFilter === "all" ||
      v.category?.toLowerCase() === categoryFilter

    const matchesSearch =
      v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSeverity && matchesCategory && matchesSearch
  })

  // ---------------- SEVERITY COUNTS ----------------

  const severityCounts = {
    critical: vulns.filter(v => v.severity === "Critical").length,
    high: vulns.filter(v => v.severity === "High").length,
    medium: vulns.filter(v => v.severity === "Medium").length,
    low: vulns.filter(v => v.severity === "Low").length,
  }

  // ---------------- EMPTY STATE ----------------

  if (vulns.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        No vulnerabilities detected yet.
      </div>
    )
  }

  // ---------------- RENDER ----------------

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        Vulnerabilities & Threats
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Critical" count={severityCounts.critical} icon={<AlertTriangle />} />
        <SummaryCard title="High" count={severityCounts.high} icon={<Shield />} />
        <SummaryCard title="Medium" count={severityCounts.medium} icon={<Settings />} />
        <SummaryCard title="Low" count={severityCounts.low} icon={<Key />} />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerability Details</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              {filteredVulnerabilities.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>
                    <Badge className={getSeverityColor(v.severity)}>
                      {v.severity}
                    </Badge>
                  </td>
                  <td>{v.category}</td>
                  <td>{v.system}</td>
                  <td>{v.description}</td>
                  <td>
                    <Badge className={getStatusColor(v.status)}>
                      {v.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* THREATS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Threat Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <p className="text-slate-500">No active threats.</p>
          ) : (
            threats.map((t, i) => (
              <div key={i} className="flex justify-between">
                <span>{t.name}</span>
                <Badge className={getSeverityColor(t.severity)}>
                  {t.severity}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- SMALL HELPER ----------
function SummaryCard({ title, count, icon }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  )
}
