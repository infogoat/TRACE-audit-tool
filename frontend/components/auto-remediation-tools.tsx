// components/auto-remediation-tools.tsx (MODIFIED)

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Calendar,
} from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"

// Icons and Tool structures are now imported as part of the RemediationTool[] type (icon: any)
// The original component used: Package, Shield, Key, Settings, Database, Server

export function AutoRemediationTools() {
  const { remediationTools, remediationHistory } = useDashboardData() // <-- DATA FETCHED HERE

  // --- REMOVED: const remediationTools = [...]
  // --- REMOVED: const remediationHistory = [...]

  const [runningTools, setRunningTools] = useState<number[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // If tools are fetched and some are marked 'running' in the data, initialize the state
    const initialRunning = remediationTools.filter(t => t.status === "running").map(t => t.id)
    setRunningTools(initialRunning)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [remediationTools])


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "running":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRunTool = (toolId: number) => {
    setRunningTools((prev) => [...prev, toolId])
    // Simulate tool completion after 3 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setRunningTools((prev) => prev.filter((id) => id !== toolId))
      // ⚠️ Add your backend call here to start the script and update status
    }, 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Auto-Remediation Tools</h1>
          <p className="text-slate-600 mt-2">
            Automated tools that fix common security issues and maintain system hardening
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remediationTools.map((tool) => {
          const IconComponent = tool.icon
          const isRunning = runningTools.includes(tool.id)

          return (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      {/* You must ensure the Icon property is the actual Lucide component from the backend/script response */}
                      {IconComponent && <IconComponent className="h-6 w-6 text-teal-600" />}
                    </div>
                    <div className="flex items-center gap-2">{getStatusIcon(isRunning ? "running" : tool.status)}</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Category:</span>
                  <Badge variant="outline">{tool.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Last Run:</span>
                  <span className="text-slate-700">{tool.lastRun}</span>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Progress:</span>
                      <span className="text-slate-700">Running...</span>
                    </div>
                    {/* Placeholder Progress value */}
                    <Progress value={65} className="h-2" /> 
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    disabled={isRunning}
                    onClick={() => handleRunTool(tool.id)}
                  >
                    {isRunning ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Remediation History */}
      <Card>
        <CardHeader>
          <CardTitle>Remediation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-slate-600">Tool Name</th>
                  <th className="text-left p-3 font-medium text-slate-600">Date Run</th>
                  <th className="text-left p-3 font-medium text-slate-600">Issues Fixed</th>
                  <th className="text-left p-3 font-medium text-slate-600">Duration</th>
                  <th className="text-left p-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {remediationHistory.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                    <td className="p-3 font-medium text-slate-800">{record.toolName}</td>
                    <td className="p-3 text-sm text-slate-600">{record.dateRun}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{record.issuesFixed}</span>
                        {record.status === "Success" && record.issuesFixed > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {record.status === "Failed" && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">{record.duration}</td>
                    <td className="p-3">
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
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