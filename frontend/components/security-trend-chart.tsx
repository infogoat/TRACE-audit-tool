// components/security-trend-chart.tsx (MODIFIED)

"use client"

import { useDashboardData } from "@/hooks/use-api-data"

export function SecurityTrendChart() {
  const { securityTrendData: data } = useDashboardData() // <-- DATA FETCHED HERE

  // --- REMOVED: const data = [...]

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500">No security trend data available.</p>
      </div>
    )
  }
  
  const maxScore = Math.max(...data.map((d) => d.score))
  const minScore = Math.min(...data.map((d) => d.score))
  // Safety check to prevent division by zero if all scores are the same
  const range = maxScore - minScore === 0 ? maxScore : maxScore - minScore
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Score Trend</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          // Calculate height based on score relative to min/max. Scale to a display range (e.g., 40px to 240px)
          const height = range === 0 
            ? 120 // Set a fixed height if scores are identical
            : ((item.score - minScore) / range) * 200 + 40
            
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <div className="text-xs text-slate-600 mb-1">{item.score}</div>
                <div
                  className="w-8 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm transition-all duration-500 hover:from-teal-600 hover:to-teal-500"
                  style={{ height: `${height}px` }}
                ></div>
                <div className="text-xs text-slate-500 mt-2">{item.month}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}