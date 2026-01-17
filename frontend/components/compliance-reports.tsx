// components/compliance-reports.tsx 

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
import { Progress } from "@/components/ui/progress"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Download, Calendar, Shield, FileText, TrendingUp, AlertCircle
} from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function ComplianceReports() {
  const {
    complianceScores,
    complianceReports,
    complianceTrendData,
    complianceRecommendations
  } = useDashboardData()

  // SAFE ARRAYS (CRITICAL FIX)
  const scores = complianceScores ?? []
  const reports = complianceReports ?? []
  const trendData = complianceTrendData ?? []
  const recommendations = complianceRecommendations ?? []

  const [frameworkFilter, setFrameworkFilter] = useState("all")
  const [dateRange, setDateRange] = useState("last-quarter")

  // ---------------- UI HELPERS ----------------

  const getScoreColor = (score: number) =>
    score >= 90 ? "text-green-600" :
    score >= 80 ? "text-yellow-600" :
    "text-red-600"

  const getScoreBgColor = (score: number) =>
    score >= 90 ? "bg-green-100" :
    score >= 80 ? "bg-yellow-100" :
    "bg-red-100"

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // ---------------- FILTERING ----------------

  const filteredReports = reports.filter(r =>
    frameworkFilter === "all" || r.framework === frameworkFilter
  )

  const frameworks = ["PCI-DSS", "HIPAA", "ISO27001", "SOX"]
  const trendLineColors: Record<string, string> = {
    "PCI-DSS": "#0d9488",
    "HIPAA": "#059669",
    "ISO27001": "#dc2626",
    "SOX": "#7c3aed"
  }

  // ---------------- EMPTY STATE ----------------

  if (
    scores.length === 0 &&
    reports.length === 0 &&
    trendData.length === 0
  ) {
    return (
      <div className="p-6 text-slate-500">
        Compliance data is not available yet.  
        Run an audit to generate reports.
      </div>
    )
  }

  // ---------------- RENDER ----------------

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        Compliance Reports
      </h1>

      {/* SCORE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scores.map(item => (
          <Card key={item.framework}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600">{item.framework}</p>
              <p className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}%
              </p>
              <Progress value={item.score} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TREND CHART */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            <TrendingUp className="h-5 w-5" />
            Compliance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                {frameworks.map(f => (
                  <Line
                    key={f}
                    dataKey={f}
                    stroke={trendLineColors[f]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center">
              No trend data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* REPORT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            <FileText className="h-5 w-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <p className="text-slate-500">
              No reports match the selected filters.
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {filteredReports.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.framework}</td>
                    <td>{r.score}%</td>
                    <td>
                      <Badge className={getScoreBgColor(r.score)}>
                        {r.status}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
