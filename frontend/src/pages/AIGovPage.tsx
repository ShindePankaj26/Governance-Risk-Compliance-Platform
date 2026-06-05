import { useQuery } from '@tanstack/react-query'
import { aigovApi } from '../utils/api'

const SAMPLE_AI_SYSTEMS = [
  { id:1, name:'Credit Scoring AI',        department:'Finance',        risk_level:'High',    trust_score:52, bias_status:'Detected',   explainability:'Medium', data_type:'PII/Financial',  status:'Remediation', framework:'EU AI Act Art.9',   owner:'Deepa Nair',   incident_count:2 },
  { id:2, name:'HR Recruitment Bot',       department:'Human Resources',risk_level:'High',    trust_score:74, bias_status:'Monitoring',  explainability:'High',   data_type:'PII/Sensitive',  status:'Active',      framework:'EEOC / DPDP',      owner:'Anita Rao',    incident_count:1 },
  { id:3, name:'Customer Chatbot',         department:'Support',        risk_level:'Limited', trust_score:91, bias_status:'None',        explainability:'High',   data_type:'General',        status:'Active',      framework:'EU AI Act Art.52',  owner:'Rahul Mehta',  incident_count:0 },
  { id:4, name:'Fraud Detection ML',       department:'Operations',     risk_level:'High',    trust_score:68, bias_status:'None',        explainability:'Low',    data_type:'Financial',      status:'Review',      framework:'RBI ML Guidelines', owner:'Vivek Singh',  incident_count:0 },
  { id:5, name:'LMS Recommendation Engine',department:'L&D',            risk_level:'Medium',  trust_score:55, bias_status:'Detected',    explainability:'Medium', data_type:'Behavioral',     status:'Remediation', framework:'Internal Policy',   owner:'Priya Sharma', incident_count:1 },
  { id:6, name:'Predictive Maintenance AI',department:'Infrastructure', risk_level:'Low',     trust_score:93, bias_status:'None',        explainability:'High',   data_type:'Operational',    status:'Active',      framework:'ISO 42001',         owner:'Aditya Kumar', incident_count:0 },
  { id:7, name:'Invoice Processing AI',    department:'Finance',        risk_level:'Medium',  trust_score:79, bias_status:'None',        explainability:'High',   data_type:'Financial',      status:'Active',      framework:'Internal Policy',   owner:'Deepa Nair',   incident_count:0 },
  { id:8, name:'Log Anomaly Detector',     department:'Security Ops',   risk_level:'Limited', trust_score:85, bias_status:'None',        explainability:'Medium', data_type:'System Logs',    status:'Active',      framework:'NIST AI RMF',       owner:'Vivek Singh',  incident_count:0 },
]

function trustColor(score: number) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function AIGovPage() {
  const { data: systems = [], isLoading } = useQuery({
    queryKey: ['ai-systems'],
    queryFn: () => aigovApi.list().then((r) => r.data),
  })

  const display = systems.length > 0 ? systems : SAMPLE_AI_SYSTEMS

  const stats = [
    { label: 'AI Systems Registered', value: display.length, color: '#ec4899' },
    { label: 'High Risk',             value: display.filter((s: any) => s.risk_level === 'High').length, color: '#ef4444' },
    { label: 'Bias Detected',         value: display.filter((s: any) => s.bias_status === 'Detected').length, color: '#f59e0b' },
    { label: 'Avg Trust Score',       value: Math.round(display.reduce((a: number, s: any) => a + s.trust_score, 0) / display.length), color: '#10b981' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">AI Governance</h1>
          <p className="text-slate-400 text-sm mt-1">Register, assess and govern AI systems across the organisation</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Register AI System
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-grc-card border border-grc-border rounded-xl p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Loading AI systems…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {display.map((s: any) => (
            <div key={s.id} className="bg-grc-card border border-grc-border rounded-xl p-5 hover:border-grc-border2 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <p className="font-bold text-sm text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.department} · {s.framework}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-extrabold" style={{ color: trustColor(s.trust_score) }}>
                    {s.trust_score}
                  </div>
                  <p className="text-[10px] text-slate-500">trust score</p>
                </div>
              </div>

              <div className="h-1.5 bg-grc-bg3 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${s.trust_score}%`, background: trustColor(s.trust_score) }} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  ['Risk Level',      s.risk_level,    s.risk_level === 'High' ? 'text-red-400' : s.risk_level === 'Medium' ? 'text-amber-400' : 'text-green-400'],
                  ['Bias Status',     s.bias_status,   s.bias_status === 'Detected' ? 'text-red-400' : s.bias_status === 'Monitoring' ? 'text-amber-400' : 'text-green-400'],
                  ['Explainability',  s.explainability, s.explainability === 'High' ? 'text-green-400' : s.explainability === 'Medium' ? 'text-amber-400' : 'text-red-400'],
                  ['Data Type',       s.data_type,     'text-slate-300'],
                ].map(([label, val, cls]) => (
                  <div key={label as string} className="bg-grc-bg3 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
                    <p className={`text-xs font-semibold ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Owner: {s.owner}</span>
                  {s.incident_count > 0 && (
                    <span className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-semibold">
                      {s.incident_count} incident{s.incident_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                  s.status === 'Active'      ? 'bg-green-500/15 text-green-400' :
                  s.status === 'Remediation' ? 'bg-red-500/15 text-red-400' :
                  'bg-amber-500/15 text-amber-400'}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
