// components/audit-results.tsx 

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Play, X } from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function AuditResults() {
  const { auditResults } = useDashboardData() // <-- DATA FETCHED HERE

  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // --- REMOVED: const auditResults = [...]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case "Low":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const filteredResults = auditResults.filter((result) => {
    const matchesSearch =
      result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.system.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || result.severity.toLowerCase() === severityFilter
    const matchesCategory = categoryFilter === "all" || result.category.toLowerCase() === categoryFilter

    return matchesSearch && matchesSeverity && matchesCategory
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">System Audit Results</h1>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by issue ID, description, or system..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              <option value="configuration">Configuration</option>
              <option value="patch missing">Patch Missing</option>
              <option value="permissions">Permissions</option>
              <option value="network">Network</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Audit Issues ({filteredResults.length} found)</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Issue ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Severity</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">System</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Detected On</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm font-medium text-slate-800">{result.id}</span>
                  </td>
                  <td className="py-4 px-6">{getSeverityBadge(result.severity)}</td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600">{result.category}</span>
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    <div className="text-sm text-slate-800">{result.description}</div>
                    <div className="text-xs text-slate-500 mt-1">{result.suggestedFix}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs text-slate-600">{result.system}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{result.detectedOn}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Play className="w-3 h-3 mr-1" />
                        Fix Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <X className="w-3 h-3 mr-1" />
                        Ignore
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
