"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Play, X } from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function AuditResults() {
  const { auditResults } = useDashboardData()
  const results = auditResults ?? []   // ✅ SAFE ARRAY

  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  // ---------------- ACTION HANDLER ----------------

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch("http://localhost:8000/api/audit-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      alert(`Issue ${id} marked as ${action}`)
    } catch {
      alert("Could not connect to backend.")
    }
  }

  // ---------------- EXPORT ----------------

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const res = await fetch("http://localhost:8000/api/results")
      const backend = await res.json()

      const rows = backend.auditResults ?? []

      const markdown = rows
        .map(
          (r: any) =>
            `### ${r.id}\n- System: ${r.system}\n- Severity: ${r.severity}\n- Category: ${r.category}\n- Description: ${r.description}\n`
        )
        .join("\n")

      const blob = new Blob([markdown], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "audit_report.md"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export report.")
    } finally {
      setIsExporting(false)
    }
  }

  // ---------------- UI HELPERS ----------------

  const getSeverityBadge = (severity: string) => {
    const map: any = {
      Critical: "bg-red-100 text-red-800",
      High: "bg-orange-100 text-orange-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-blue-100 text-blue-800",
    }
    return <Badge className={map[severity] ?? ""}>{severity}</Badge>
  }

  // ---------------- FILTERING ----------------

  const filteredResults = results.filter((r) => {
    const s = searchTerm.toLowerCase()
    return (
      (r.description?.toLowerCase().includes(s) ||
        r.id?.toLowerCase().includes(s) ||
        r.system?.toLowerCase().includes(s)) &&
      (severityFilter === "all" || r.severity?.toLowerCase() === severityFilter) &&
      (categoryFilter === "all" || r.category?.toLowerCase() === categoryFilter)
    )
  })

  // ---------------- EMPTY STATE ----------------

  if (results.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        No audit results available yet.
      </div>
    )
  }

  // ---------------- RENDER ----------------

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">System Audit Results</h1>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <table className="w-full bg-white border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Severity</th>
            <th>Category</th>
            <th>Description</th>
            <th>System</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{getSeverityBadge(r.severity)}</td>
              <td>{r.category}</td>
              <td>{r.description}</td>
              <td>{r.system}</td>
              <td>
                <Button size="sm" onClick={() => handleAction(r.id, "fix")}>
                  <Play className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "ignore")}>
                  <X className="w-3 h-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
