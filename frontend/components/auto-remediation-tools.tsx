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

export function AutoRemediationTools() {
  const { remediationTools, remediationHistory } = useDashboardData()

  // ✅ SAFE ARRAYS (MOST IMPORTANT FIX)
  const tools = remediationTools ?? []
  const history = remediationHistory ?? []

  const [runningTools, setRunningTools] = useState<number[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ SAFE useEffect
  useEffect(() => {
    const initialRunning = tools
      .filter((t) => t.status === "running")
      .map((t) => t.id)

    setRunningTools(initialRunning)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [tools])

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

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setRunningTools((prev) => prev.filter((id) => id !== toolId))
    }, 3000)
  }

  // ✅ EMPTY STATE (NO CRASH)
  if (tools.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        No auto-remediation tools available yet.
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Auto-Remediation Tools
        </h1>
        <p className="text-slate-600 mt-2">
          Automated tools that fix common security issues
        </p>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon
          const isRunning = runningTools.includes(tool.id)

          return (
            <Card key={tool.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    {IconComponent && (
                      <IconComponent className="h-6 w-6 text-teal-600" />
                    )}
                  </div>
                  {getStatusIcon(isRunning ? "running" : tool.status)}
                </div>
                <CardTitle>{tool.name}</CardTitle>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <Badge variant="outline">{tool.category}</Badge>

                {isRunning && (
                  <>
                    <Progress value={65} />
                    <span className="text-sm text-slate-600">Running…</span>
                  </>
                )}

                <Button
                  disabled={isRunning}
                  onClick={() => handleRunTool(tool.id)}
                >
                  {isRunning ? "Running…" : "Run Now"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle>Remediation History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-slate-500">No history available.</p>
          ) : (
            <table className="w-full">
              <tbody>
                {history.map((record, index) => (
                  <tr key={index}>
                    <td>{record.toolName}</td>
                    <td>{record.dateRun}</td>
                    <td>{record.issuesFixed}</td>
                    <td>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
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
