"use client"

export function SecurityTrendChart() {
  const data = [
    { month: "Jan", score: 65 },
    { month: "Feb", score: 68 },
    { month: "Mar", score: 72 },
    { month: "Apr", score: 70 },
    { month: "May", score: 75 },
    { month: "Jun", score: 78 },
  ]

  const maxScore = Math.max(...data.map((d) => d.score))
  const minScore = Math.min(...data.map((d) => d.score))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Score Trend</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const height = ((item.score - minScore) / (maxScore - minScore)) * 200 + 40
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
