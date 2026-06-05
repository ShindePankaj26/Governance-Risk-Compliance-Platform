import { useQuery } from '@tanstack/react-query'
import { policiesApi } from '../utils/api'
import { FileText } from 'lucide-react'

const SAMPLE_POLICIES = [
  { id:1, policy_id:'POL-001', title:'Information Security Policy',         owner:'CISO',    version:'v4.2', status:'Active',       review_date:'2025-01-15', next_review:'2026-01-15', mapped_frameworks:'ISO 27001,SOC 2,GDPR' },
  { id:2, policy_id:'POL-002', title:'Data Classification & Handling Policy',owner:'DPO',    version:'v2.1', status:'Active',       review_date:'2024-11-01', next_review:'2025-11-01', mapped_frameworks:'GDPR,DPDP 2023' },
  { id:3, policy_id:'POL-003', title:'Acceptable Use Policy (AUP)',          owner:'IT Head', version:'v3.0', status:'Active',       review_date:'2025-03-01', next_review:'2026-03-01', mapped_frameworks:'ISO 27001,SOC 2' },
  { id:4, policy_id:'POL-004', title:'Third-Party Risk Management Policy',   owner:'CRO',    version:'v1.5', status:'Review Due',   review_date:'2024-09-01', next_review:'2025-09-01', mapped_frameworks:'ISO 27001,PCI DSS' },
  { id:5, policy_id:'POL-005', title:'AI Ethics & Governance Policy',        owner:'CDO',    version:'v1.0', status:'Under Review', review_date:'2025-02-28', next_review:'2025-08-28', mapped_frameworks:'EU AI Act,Internal' },
  { id:6, policy_id:'POL-006', title:'Incident Response Policy',             owner:'CISO',   version:'v5.1', status:'Active',       review_date:'2025-05-01', next_review:'2026-05-01', mapped_frameworks:'ISO 27001,SOC 2,GDPR' },
  { id:7, policy_id:'POL-007', title:'Business Continuity & DR Policy',      owner:'COO',    version:'v3.3', status:'Overdue',      review_date:'2024-07-01', next_review:'2025-07-01', mapped_frameworks:'ISO 22301,SOC 2' },
  { id:8, policy_id:'POL-008', title:'Access Control & IAM Policy',          owner:'IT Head', version:'v2.8', status:'Active',      review_date:'2025-04-01', next_review:'2026-04-01', mapped_frameworks:'ISO 27001,PCI DSS' },
  { id:9, policy_id:'POL-009', title:'Cryptography & Key Management Policy', owner:'CISO',   version:'v1.2', status:'Active',       review_date:'2025-02-01', next_review:'2026-02-01', mapped_frameworks:'ISO 27001,PCI DSS' },
  { id:10,policy_id:'POL-010', title:'Vendor & Supplier Security Policy',    owner:'CRO',    version:'v2.0', status:'Under Review', review_date:'2025-05-15', next_review:'2025-11-15', mapped_frameworks:'ISO 27001,GDPR' },
]

const statusStyle: Record<string, string> = {
  Active:        'bg-green-500/15 text-green-400',
  'Review Due':  'bg-amber-500/15 text-amber-400',
  'Under Review':'bg-blue-500/15 text-blue-400',
  Overdue:       'bg-red-500/15 text-red-400',
  Draft:         'bg-slate-500/15 text-slate-400',
}

export default function PoliciesPage() {
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policiesApi.list().then((r) => r.data),
  })

  const display = policies.length > 0 ? policies : SAMPLE_POLICIES

  const stats = [
    { label: 'Total Policies',  value: display.length, color: '#8b5cf6' },
    { label: 'Active',          value: display.filter((p: any) => p.status === 'Active').length, color: '#10b981' },
    { label: 'Under Review',    value: display.filter((p: any) => p.status === 'Under Review').length, color: '#3b82f6' },
    { label: 'Overdue',         value: display.filter((p: any) => p.status === 'Overdue').length, color: '#ef4444' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Policy Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create, review and manage organisational security policies</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + New Policy
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
        <div className="text-center text-slate-500 py-12">Loading policies…</div>
      ) : (
        <div className="space-y-3">
          {display.map((p: any) => (
            <div key={p.id} className="bg-grc-card border border-grc-border rounded-xl p-4 flex items-center gap-4 hover:border-grc-border2 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-blue-400 font-bold">{p.policy_id}</span>
                  <span className="text-sm font-semibold text-white truncate">{p.title}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500 mb-2">
                  <span>Owner: {p.owner}</span>
                  <span>{p.version}</span>
                  <span>Reviewed: {p.review_date}</span>
                  <span>Next: {p.next_review}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(p.mapped_frameworks || '').split(',').map((fw: string) => (
                    <span key={fw} className="bg-grc-bg3 text-slate-400 text-[10px] px-2 py-0.5 rounded font-medium">
                      {fw.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`text-[11px] px-3 py-1 rounded-full font-semibold flex-shrink-0 ${statusStyle[p.status] || 'bg-slate-500/15 text-slate-400'}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
