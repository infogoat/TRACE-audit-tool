import { SecurityScoreGauge } from "@/components/security-score-gauge"
import { VulnerabilityCards } from "@/components/vulnerability-cards"
import { RecentScansTable } from "@/components/recent-scans-table"
import { SecurityTrendChart } from "@/components/security-trend-chart"
import { IssueDistributionChart } from "@/components/issue-distribution-chart"

export function DashboardOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Security Dashboard</h1>
        <div className="text-sm text-slate-500">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SecurityScoreGauge />
        </div>
        <div className="lg:col-span-2">
          <VulnerabilityCards />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SecurityTrendChart />
        <IssueDistributionChart />
      </div>

      <RecentScansTable />
    </div>
  )
}
