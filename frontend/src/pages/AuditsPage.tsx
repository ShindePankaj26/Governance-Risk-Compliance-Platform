import { useQuery } from '@tanstack/react-query'
import { auditsApi } from '../utils/api'

const SAMPLE_AUDITS = [
  { id:1, title:'ISO 27001 Surveillance Audit',   audit_type:'External', progress:72, status:'In Progress', findings_count:4,  framework:'ISO 27001',  owner:'Arjun K',   start_date:'2025-04-01', end_date:'2025-07-31' },
  { id:2, title:'PCI DSS QSA Assessment',         audit_type:'External', progress:35, status:'In Progress', findings_count:7,  framework:'PCI DSS',    owner:'Vivek S',   start_date:'2025-05-01', end_date:'2025-09-30' },
  { id:3, title:'IT General Controls Review',     audit_type:'Internal', progress:88, status:'In Progress', findings_count:2,  framework:'Internal',   owner:'Anita R',   start_date:'2025-03-01', end_date:'2025-06-30' },
  { id:4, title:'Vendor Security Audit',          audit_type:'Internal', progress:20, status:'Planning',    findings_count:0,  framework:'ISO 27001',  owner:'Priya S',   start_date:'2025-06-01', end_date:'2025-08-31' },
  { id:5, title:'GDPR Article 32 Review',         audit_type:'Internal', progress:100,status:'Completed',   findings_count:5,  framework:'GDPR',       owner:'Rahul M',   start_date:'2025-01-01', end_date:'2025-03-31' },
  { id:6, title:'SOC 2 Readiness Assessment',     audit_type:'External', progress:100,status:'Completed',   findings_count:3,  framework:'SOC 2',      owner:'Deepa N',   start_date:'2024-11-01', end_date:'2025-01-31' },
  { id:7, title:'DPDP Act Gap Analysis',          audit_type:'Internal', progress:45, status:'In Progress', findings_count:8,  framework:'DPDP 2023',  owner:'Rahul M',   start_date:'2025-05-15', end_date:'2025-07-15' },
]

const SAMPLE_FINDINGS = [
  { id:1, audit_id:1, title:'Network segmentation gaps in DMZ',    severity:'Critical', status:'Open',       owner:'Vivek Singh',   due_date:'2025-06-30' },
  { id:2, audit_id:1, title:'MFA not enforced on privileged accounts', severity:'High', status:'Remediation', owner:'Anita Rao',     due_date:'2025-06-15' },
  { id:3, audit_id:2, title:'Cardholder data stored in clear text',severity:'Critical', status:'Open',       owner:'Aditya Kumar',  due_date:'2025-07-01' },
  { id:4, audit_id:2, title:'Patch management SLA breach',         severity:'High',     status:'In Progress', owner:'Vivek Singh',   due_date:'2025-06-20' },
  { id:5, audit_id:5, title:'DPIA not conducted for new processing',severity:'High',    status:'Closed',     owner:'Rahul Mehta',   due_date:'2025-03-15' },
]

export default function AuditsPage() {
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => auditsApi.list().then((r) => r.data),
  })

  const display = audits.length > 0 ? audits : SAMPLE_AUDITS

  const stats = [
    { label: 'Total Audits',    value: display.length, color: '#06b6d4' },
    { label: 'In Progress',     value: display.filter((a: any) => a.status === 'In Progress').length, color: '#3b82f6' },
    { label: 'Open Findings',   value: SAMPLE_FINDINGS.filter(f => f.status !== 'Closed').length, color: '#ef4444' },
    { label: 'Completed FY25',  value: display.filter((a: any) => a.status === 'Completed').length, color: '#10b981' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Audit Management</h1>
          <p className="text-slate-400 text-sm mt-1">Plan, execute and track internal and external audits</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + New Audit
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

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Audit list */}
        <div className="bg-grc-card border border-grc-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-grc-border">
            <h2 className="text-sm font-semibold">Active & Recent Audits</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">Loading…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-grc-border">
                  {['Audit', 'Type', 'Progress', 'Findings', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {display.map((a: any) => (
                  <tr key={a.id} className="border-b border-grc-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-slate-200 max-w-[160px]">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.framework}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${a.audit_type === 'External' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                        {a.audit_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-grc-bg3 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${a.progress}%`,
                            background: a.progress === 100 ? '#10b981' : a.progress > 50 ? '#3b82f6' : '#f59e0b'
                          }} />
                        </div>
                        <span className="text-[11px] text-slate-500 w-7">{a.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 text-center">{a.findings_count}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        a.status === 'Completed' ? 'bg-green-500/15 text-green-400' :
                        a.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400' :
                        'bg-amber-500/15 text-amber-400'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Findings */}
        <div className="bg-grc-card border border-grc-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-grc-border">
            <h2 className="text-sm font-semibold">Recent Findings</h2>
          </div>
          <div className="p-4 space-y-3">
            {SAMPLE_FINDINGS.map((f) => (
              <div key={f.id} className="bg-grc-bg3 rounded-lg p-3 border border-grc-border">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-slate-200 flex-1 pr-2">{f.title}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold flex-shrink-0 ${
                    f.severity === 'Critical' ? 'bg-red-500/15 text-red-400' :
                    f.severity === 'High' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/15 text-amber-400'}`}>
                    {f.severity}
                  </span>
                </div>
                <div className="flex gap-3 text-[11px] text-slate-500">
                  <span>Owner: {f.owner}</span>
                  <span>Due: {f.due_date}</span>
                  <span className={`font-semibold ${f.status === 'Closed' ? 'text-green-400' : f.status === 'Open' ? 'text-red-400' : 'text-amber-400'}`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-grc-card border border-grc-border rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Audit Timeline 2025</h2>
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-grc-border" />
          {[
            { date: 'Jan 2025', event: 'SOC 2 Type II audit completed — report issued', type: 'success' },
            { date: 'Feb 2025', event: 'IT General Controls assessment commenced', type: 'info' },
            { date: 'Mar 2025', event: '5 critical findings raised: network segmentation gaps', type: 'danger' },
            { date: 'Apr 2025', event: 'PCI DSS QSA engagement commenced', type: 'info' },
            { date: 'May 2025', event: 'ISO 27001 annual surveillance audit started', type: 'info' },
            { date: 'Jun 2025', event: 'Target: IT General Controls completed', type: 'pending' },
            { date: 'Aug 2025', event: 'Target: ISO 27001 surveillance complete', type: 'pending' },
            { date: 'Sep 2025', event: 'Target: PCI DSS QSA assessment report', type: 'pending' },
          ].map((item, i) => (
            <div key={i} className="relative mb-4 last:mb-0">
              <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-grc-bg2 ${
                item.type === 'success' ? 'bg-green-500' :
                item.type === 'danger'  ? 'bg-red-500' :
                item.type === 'pending' ? 'bg-slate-600' : 'bg-blue-500'}`} />
              <p className="text-[11px] text-slate-500 mb-0.5">{item.date}</p>
              <p className="text-sm text-slate-300">{item.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
