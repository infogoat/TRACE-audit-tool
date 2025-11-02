// components/recent-scans-table.tsx 
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Eye, MoreHorizontal } from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

export function RecentScansTable() {
  const { recentScans: scans } = useDashboardData() // <-- DATA FETCHED HERE

  // --- REMOVED: const scans = [...]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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
        return <Badge variant="outline">None</Badge>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Recent Scan Activity</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">System Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Date & Time</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Issues Found</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Severity</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="font-medium text-slate-800">{scan.system}</div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{scan.date}</td>
                <td className="py-4 px-6">{getStatusBadge(scan.status)}</td>
                <td className="py-4 px-6">
                  <span className="font-medium text-slate-800">{scan.issues}</span>
                </td>
                <td className="py-4 px-6">{getSeverityBadge(scan.severity)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}