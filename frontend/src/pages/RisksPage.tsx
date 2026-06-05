import { useQuery } from '@tanstack/react-query'
import { risksApi } from '../utils/api'

const severityColor: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/15',
  High:     'text-red-400 bg-red-500/15',
  Medium:   'text-amber-400 bg-amber-500/15',
  Low:      'text-green-400 bg-green-500/15',
}

function scoreColor(score: number) {
  if (score >= 16) return '#ef4444'
  if (score >= 10) return '#f59e0b'
  return '#10b981'
}

export default function RisksPage() {
  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: () => risksApi.list().then((r) => r.data),
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Risk Register</h1>
          <p className="text-slate-400 text-sm mt-1">Identify, assess and treat organisational risks</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + Add Risk
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Risks',    value: risks.length || 47,  color: '#06b6d4' },
          { label: 'Critical / High',value: 12,                  color: '#ef4444' },
          { label: 'Medium',         value: 19,                  color: '#f59e0b' },
          { label: 'Residual Score', value: '3.2',               color: '#10b981' },
        ].map((s) => (
          <div key={s.label} className="bg-grc-card border border-grc-border rounded-xl p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-grc-card border border-grc-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-grc-border">
          <h2 className="text-sm font-semibold">All Risks</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading risks…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grc-border">
                  {['ID','Risk','Category','Likelihood','Impact','Score','Owner','Treatment','Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(risks.length > 0 ? risks : SAMPLE_RISKS).map((r: any, i: number) => (
                  <tr key={r.id || i} className="border-b border-grc-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-blue-400 font-semibold text-sm">{r.risk_id || r.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-200 max-w-xs truncate">{r.title}</td>
                    <td className="px-4 py-3"><span className="bg-grc-bg3 text-slate-400 text-[11px] px-2 py-0.5 rounded font-medium">{r.category}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${severityColor[r.likelihood] || ''}`}>{r.likelihood}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${severityColor[r.impact] || ''}`}>{r.impact}</span></td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: scoreColor(r.risk_score || 0) }}>{r.risk_score}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{r.owner}</td>
                    <td className="px-4 py-3"><span className="bg-blue-500/15 text-blue-400 text-[11px] px-2 py-0.5 rounded font-semibold">{r.treatment}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${r.status === 'Closed' ? 'bg-green-500/15 text-green-400' : r.status === 'Open' || r.status === 'Escalated' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const SAMPLE_RISKS = [
  { risk_id:'R-001', title:'Ransomware attack on infrastructure',        category:'Cybersecurity', likelihood:'High',   impact:'Critical',     risk_score:20, owner:'Vivek Singh',   treatment:'Mitigate', status:'Open' },
  { risk_id:'R-002', title:'DPDP Act non-compliance penalty',            category:'Regulatory',    likelihood:'Medium', impact:'High',         risk_score:12, owner:'Rahul Mehta',   treatment:'Transfer', status:'In Progress' },
  { risk_id:'R-003', title:'Third-party vendor data leakage',            category:'Vendor',        likelihood:'High',   impact:'High',         risk_score:16, owner:'Priya Sharma',  treatment:'Mitigate', status:'Open' },
  { risk_id:'R-004', title:'Cloud misconfiguration exposure',            category:'Cybersecurity', likelihood:'Medium', impact:'High',         risk_score:12, owner:'Aditya Kumar',  treatment:'Mitigate', status:'Remediation' },
  { risk_id:'R-005', title:'Insider threat — privileged access abuse',   category:'Operational',   likelihood:'Low',    impact:'Critical',     risk_score:10, owner:'Anita Rao',     treatment:'Accept',   status:'Monitoring' },
  { risk_id:'R-006', title:'AI model hallucination in finance decisions',category:'AI Risk',       likelihood:'Medium', impact:'High',         risk_score:12, owner:'Deepa Nair',    treatment:'Mitigate', status:'Open' },
  { risk_id:'R-007', title:'Business continuity plan gap',               category:'Operational',   likelihood:'Low',    impact:'Moderate',     risk_score:6,  owner:'Arjun Kulkarni',treatment:'Mitigate', status:'Closed' },
  { risk_id:'R-008', title:'Supply chain compromise via vendor',         category:'Vendor',        likelihood:'High',   impact:'Catastrophic',  risk_score:20, owner:'Priya Sharma',  treatment:'Transfer', status:'Escalated' },
  { risk_id:'R-009', title:'Social engineering / phishing campaigns',    category:'Cybersecurity', likelihood:'High',   impact:'Moderate',     risk_score:12, owner:'Vivek Singh',   treatment:'Mitigate', status:'In Progress' },
  { risk_id:'R-010', title:'Data residency violation — EU customers',    category:'Regulatory',    likelihood:'Medium', impact:'High',         risk_score:12, owner:'Rahul Mehta',   treatment:'Mitigate', status:'Open' },
]
