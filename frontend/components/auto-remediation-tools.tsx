"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Calendar } from "lucide-react"

type RemediationTool = {
  id: number
  system: string
  issue: string
  risk: string
  recommendedAction: string
  linuxFix?: string
  windowsFix?: string
  status: string
}

export function AutoRemediationTools() {
  const [tools, setTools] = useState<RemediationTool[]>([])
  const [runningTools, setRunningTools] = useState<number[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ FETCH FROM BACKEND (ONLY SOURCE)
  useEffect(() => {
  fetch("http://localhost:8000/api/remediation")
    .then(res => res.json())
    .then(data => {
      setTools(data.remediationTools ?? [])
    })
    .catch(() => setTools([]))
}, [])

  const run_remediation = async (system: string) => {
  const res = await fetch("http://localhost:8000/api/remediation/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system })
  })

  const data = await res.json()
  alert(data.message)
}
  const handleRunTool = (toolId: number) => {
    setRunningTools((prev) => [...prev, toolId])

    timeoutRef.current = setTimeout(() => {
      setRunningTools((prev) => prev.filter((id) => id !== toolId))
    }, 3000)
  }

  if (tools.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        No auto-remediation tools available yet.
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Auto-Remediation Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const isRunning = runningTools.includes(tool.id)

          return (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle>{tool.issue}</CardTitle>
                <p className="text-sm text-slate-600">
                  System: {tool.system}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <Badge variant="outline">{tool.risk} Risk</Badge>

                <p className="text-sm">{tool.recommendedAction}</p>

                {isRunning && (
                  <>
                    <Progress value={60} />
                    <span className="text-sm text-slate-500">
                      Executing remediation…
                    </span>
                  </>
                )}

                <Button
                  disabled={isRunning}
                  onClick={() => handleRunTool(tool.id)}
                >
                  {isRunning ? "Running…" : "Run Remediation"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
