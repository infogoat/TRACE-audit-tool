// components/compliance-reports.tsx 

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, Calendar, Shield, FileText, TrendingUp, AlertCircle } from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function ComplianceReports() {
  const { 
    complianceScores, 
    complianceReports, 
    complianceTrendData: trendData, 
    complianceRecommendations: recommendations 
  } = useDashboardData() // <-- DATA FETCHED HERE

  // --- REMOVED: const complianceScores = [...]
  // --- REMOVED: const complianceReports = [...]
  // --- REMOVED: const trendData = [...]
  // --- REMOVED: const recommendations = [...]

  const [frameworkFilter, setFrameworkFilter] = useState("all")
  const [dateRange, setDateRange] = useState("last-quarter")

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100"
    if (score >= 80) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReports = complianceReports.filter((report) => {
    return frameworkFilter === "all" || report.framework === frameworkFilter
  })
  
  // Helper array for chart lines (since it's hardcoded in the original)
  const frameworks = ["PCI-DSS", "HIPAA", "ISO27001", "SOX"]
  const trendLineColors = {
      "PCI-DSS": "#0d9488",
      "HIPAA": "#059669",
      "ISO27001": "#dc2626",
      "SOX": "#7c3aed"
  }
  const isChartDataAvailable = trendData.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Compliance Reports</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Compliance Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                <SelectItem value="HIPAA">HIPAA</SelectItem>
                <SelectItem value="ISO27001">ISO27001</SelectItem>
                <SelectItem value="SOX">SOX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Custom Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceScores.map((item) => (
          <Card key={item.framework} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.framework}</p>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.score}%</p>
                </div>
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  <Shield className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Compliance Level</span>
                  <span className={item.color}>
                    {item.score >= 90 ? "Excellent" : item.score >= 80 ? "Good" : "Needs Improvement"}
                  </span>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isChartDataAvailable ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[70, 100]} />
                            <Tooltip />
                            {/* Dynamically render lines for each framework */}
                            {frameworks.map(framework => (
                                <Line 
                                    key={framework}
                                    type="monotone" 
                                    dataKey={framework} 
                                    stroke={trendLineColors[framework as keyof typeof trendLineColors]} 
                                    strokeWidth={2} 
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        No compliance trend data available.
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rec.framework}</Badge>
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{rec.recommendation}</p>
                    <p className="text-xs text-slate-500">{rec.impact}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-slate-600">Report Name</th>
                  <th className="text-left p-3 font-medium text-slate-600">Framework</th>
                  <th className="text-left p-3 font-medium text-slate-600">Date Generated</th>
                  <th className="text-left p-3 font-medium text-slate-600">Compliance Score</th>
                  <th className="text-left p-3 font-medium text-slate-600">Status</th>
                  <th className="text-left p-3 font-medium text-slate-600">Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, index) => (
                  <tr key={report.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                    <td className="p-3 font-medium text-slate-800">{report.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{report.framework}</Badge>
                    </td>
                    <td className="p-3 text-sm text-slate-600">{report.dateGenerated}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getScoreColor(report.score)}`}>{report.score}%</span>
                        <div className={`w-2 h-2 rounded-full ${getScoreBgColor(report.score)}`} />
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={
                          report.status === "Complete" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {report.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}