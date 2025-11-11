// components/security-score-gauge.tsx (MODIFIED)

"use client"

import { useDashboardData } from "@/hooks/use-api-data"

export function SecurityScoreGauge() {
  const { securityScore: score } = useDashboardData() // <-- DATA FETCHED HERE
  
  // --- REMOVED: const score = 78

  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  // Placeholder for status text based on score (adjust ranges as needed)
  const status = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"
  const statusColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-teal-600" : "text-red-600"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Score</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#0d9488"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{score}</div>
              <div className="text-xs text-slate-500">out of 100</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-slate-600">
          <span className={`${statusColor} font-medium`}>{status}</span> security posture
        </div>
        <div className="text-xs text-slate-500 mt-1">Data from backend</div>
      </div>
    </div>
  )
}