import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../utils/api'
import {
  AlertTriangle, ShieldCheck, Building2, ClipboardList,
  FileText, Bot, TrendingUp
} from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  color: string
  icon: React.ReactNode
  sub?: string
}

function MetricCard({ label, value, color, icon, sub }: MetricCardProps) {
  return (
    <div className="bg-grc-card border border-grc-border rounded-xl p-5">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}20` }}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1 mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

const frameworks = [
  { name: 'ISO 27001:2022',  score: 92, color: '#10b981', controls: 114, passed: 105 },
  { name: 'SOC 2 Type II',   score: 85, color: '#10b981', controls: 64,  passed: 54 },
  { name: 'GDPR',            score: 78, color: '#f59e0b', controls: 48,  passed: 37 },
  { name: 'PCI DSS v4.0',    score: 71, color: '#f59e0b', controls: 200, passed: 142 },
  { name: 'DPDP Act 2023',   score: 55, color: '#ef4444', controls: 40,  passed: 22 },
  { name: 'NIST CSF 2.0',    score: 88, color: '#10b981', controls: 108, passed: 95 },
]

export default function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardApi.getMetrics().then((r) => r.data),
  })

  const cards = [
    { label: 'Critical Risks',      value: metrics?.critical_risks ?? 12,   color: '#ef4444', icon: <AlertTriangle size={18} color="#ef4444" />, sub: 'Requires immediate action' },
    { label: 'Compliance Score',    value: `${metrics?.compliance_score ?? 87}%`, color: '#10b981', icon: <ShieldCheck size={18} color="#10b981" />, sub: 'QoQ +4% improvement' },
    { label: 'Vendor Avg Score',    value: metrics?.vendor_avg_score ?? 68,  color: '#f59e0b', icon: <Building2 size={18} color="#f59e0b" />, sub: 'Across all vendors' },
    { label: 'Open Audits',         value: metrics?.open_audits ?? 7,        color: '#3b82f6', icon: <ClipboardList size={18} color="#3b82f6" />, sub: '3 due this quarter' },
    { label: 'Active Policies',     value: metrics?.active_policies ?? 38,   color: '#8b5cf6', icon: <FileText size={18} color="#8b5cf6" />, sub: '3 overdue for review' },
    { label: 'AI Systems Tracked',  value: metrics?.ai_systems ?? 14,        color: '#ec4899', icon: <Bot size={18} color="#ec4899" />, sub: `${metrics?.high_risk_ai ?? 4} high-risk` },
    { label: 'Total Risks',         value: metrics?.total_risks ?? 47,       color: '#06b6d4', icon: <TrendingUp size={18} color="#06b6d4" />, sub: 'Across all categories' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Executive Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time governance, risk &amp; compliance overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.slice(0, 4).map((c) => <MetricCard key={c.label} {...c} />)}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {cards.slice(4).map((c) => <MetricCard key={c.label} {...c} />)}
      </div>

      {/* Framework Progress */}
      <div className="bg-grc-card border border-grc-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-grc-border">
          <h2 className="text-sm font-semibold">Compliance Frameworks</h2>
        </div>
        <div className="p-5 space-y-4">
          {frameworks.map((f) => (
            <div key={f.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{f.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{f.passed}/{f.controls} controls</span>
                  <span className="text-base font-bold" style={{ color: f.color }}>{f.score}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-grc-bg3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${f.score}%`, background: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
