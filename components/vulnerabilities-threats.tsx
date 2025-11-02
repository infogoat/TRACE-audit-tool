"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Calendar, AlertTriangle, Shield, Settings, Key } from "lucide-react"

const vulnerabilities = [
  {
    id: "CVE-2024-001",
    severity: "Critical",
    category: "Configuration",
    system: "Web Server",
    description: "Unpatched Apache vulnerability allowing remote code execution",
    dateDetected: "2024-01-15",
    status: "Open",
  },
  {
    id: "CVE-2024-002",
    severity: "High",
    category: "Patch",
    system: "Database Server",
    description: "MySQL privilege escalation vulnerability",
    dateDetected: "2024-01-14",
    status: "In Progress",
  },
  {
    id: "CVE-2024-003",
    severity: "Medium",
    category: "Permissions",
    system: "File Server",
    description: "Excessive file permissions on sensitive directories",
    dateDetected: "2024-01-13",
    status: "Resolved",
  },
  {
    id: "CVE-2024-004",
    severity: "Low",
    category: "Configuration",
    system: "Mail Server",
    description: "Weak SSL/TLS configuration detected",
    dateDetected: "2024-01-12",
    status: "Open",
  },
]

const recentThreats = [
  { name: "Brute Force Attack", severity: "High", time: "2 hours ago" },
  { name: "Suspicious Login", severity: "Medium", time: "4 hours ago" },
  { name: "Port Scan Detected", severity: "Low", time: "6 hours ago" },
  { name: "Malware Signature", severity: "Critical", time: "8 hours ago" },
]

export function VulnerabilitiesThreats() {
  const [severityFilter, setSeverityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const filteredVulnerabilities = vulnerabilities.filter((vuln) => {
    const matchesSeverity = severityFilter === "all" || vuln.severity.toLowerCase() === severityFilter
    const matchesCategory = categoryFilter === "all" || vuln.category.toLowerCase() === categoryFilter
    const matchesSearch =
      vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSeverity && matchesCategory && matchesSearch
  })

  const severityCounts = {
    critical: vulnerabilities.filter((v) => v.severity === "Critical").length,
    high: vulnerabilities.filter((v) => v.severity === "High").length,
    medium: vulnerabilities.filter((v) => v.severity === "Medium").length,
    low: vulnerabilities.filter((v) => v.severity === "Low").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Vulnerabilities & Threats</h1>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search vulnerabilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
                <SelectItem value="patch">Patch</SelectItem>
                <SelectItem value="permissions">Permissions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">{severityCounts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High</p>
                <p className="text-3xl font-bold text-orange-600">{severityCounts.high}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Medium</p>
                <p className="text-3xl font-bold text-yellow-600">{severityCounts.medium}</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Low</p>
                <p className="text-3xl font-bold text-blue-600">{severityCounts.low}</p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Vulnerabilities Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-slate-600">ID</th>
                      <th className="text-left p-3 font-medium text-slate-600">Severity</th>
                      <th className="text-left p-3 font-medium text-slate-600">Category</th>
                      <th className="text-left p-3 font-medium text-slate-600">System</th>
                      <th className="text-left p-3 font-medium text-slate-600">Description</th>
                      <th className="text-left p-3 font-medium text-slate-600">Date</th>
                      <th className="text-left p-3 font-medium text-slate-600">Status</th>
                      <th className="text-left p-3 font-medium text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVulnerabilities.map((vuln, index) => (
                      <tr key={vuln.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                        <td className="p-3 font-mono text-sm">{vuln.id}</td>
                        <td className="p-3">
                          <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                        </td>
                        <td className="p-3 text-sm">{vuln.category}</td>
                        <td className="p-3 text-sm">{vuln.system}</td>
                        <td className="p-3 text-sm max-w-xs truncate">{vuln.description}</td>
                        <td className="p-3 text-sm">{vuln.dateDetected}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(vuln.status)}>{vuln.status}</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            View Details
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

        {/* Recent Threat Alerts Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Threat Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentThreats.map((threat, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-800">{threat.name}</p>
                    <p className="text-xs text-slate-500">{threat.time}</p>
                  </div>
                  <Badge className={getSeverityColor(threat.severity)} size="sm">
                    {threat.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
