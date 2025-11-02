"use client"

export function IssueDistributionChart() {
  const data = [
    { category: "Configuration", count: 35, color: "#ef4444" },
    { category: "Patch Missing", count: 28, color: "#f97316" },
    { category: "Permissions", count: 18, color: "#eab308" },
    { category: "Network", count: 12, color: "#3b82f6" },
    { category: "Other", count: 7, color: "#6b7280" },
  ]

  const total = data.reduce((sum, item) => sum + item.count, 0)
  let cumulativePercentage = 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Issue Distribution</h3>
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = -cumulativePercentage
              cumulativePercentage += percentage

              return (
                <circle
                  key={item.category}
                  cx="50"
                  cy="50"
                  r="15.915"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{total}</div>
              <div className="text-xs text-slate-500">Total Issues</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-slate-700">{item.category}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-800">{item.count}</span>
              <span className="text-xs text-slate-500">({Math.round((item.count / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
