import { useQuery } from '@tanstack/react-query'
import { complianceApi } from '../utils/api'

const SAMPLE_FRAMEWORKS = [
  {
    id: 1, name: 'ISO/IEC 27001:2022', score: 92, total_controls: 114,
    compliant_controls: 105, partial_controls: 7, nc_controls: 2,
    color: '#10b981', owner: 'CISO', next_review: '2025-08-01',
    domains: ['A.5 Org Controls (34/34)', 'A.6 People Controls (8/8)', 'A.8 Tech Controls (58/63)', 'A.9 Physical (5/7)'],
  },
  {
    id: 2, name: 'SOC 2 Type II', score: 85, total_controls: 64,
    compliant_controls: 54, partial_controls: 8, nc_controls: 2,
    color: '#10b981', owner: 'CTO', next_review: '2025-06-30',
    domains: ['CC1 Control Environment', 'CC6 Logical Access', 'CC7 System Operations', 'CC9 Risk Mitigation'],
  },
  {
    id: 3, name: 'GDPR / EU Data Protection', score: 78, total_controls: 48,
    compliant_controls: 37, partial_controls: 8, nc_controls: 3,
    color: '#f59e0b', owner: 'DPO', next_review: '2025-07-15',
    domains: ['Art 5 Principles', 'Art 13 Transparency', 'Art 25 Privacy by Design', 'Art 32 Security'],
  },
  {
    id: 4, name: 'PCI DSS v4.0', score: 71, total_controls: 200,
    compliant_controls: 142, partial_controls: 40, nc_controls: 18,
    color: '#f59e0b', owner: 'CIO', next_review: '2025-09-01',
    domains: ['Req 1 Network Security', 'Req 3 Account Data', 'Req 6 Secure Systems', 'Req 12 Policies'],
  },
  {
    id: 5, name: 'DPDP Act 2023 (India)', score: 55, total_controls: 40,
    compliant_controls: 22, partial_controls: 12, nc_controls: 6,
    color: '#ef4444', owner: 'DPO', next_review: '2025-12-01',
    domains: ['Data Fiduciary Obligations', 'Consent Framework', 'Data Principal Rights', 'Grievance Redressal'],
  },
  {
    id: 6, name: 'NIST CSF 2.0', score: 88, total_controls: 108,
    compliant_controls: 95, partial_controls: 10, nc_controls: 3,
    color: '#10b981', owner: 'CISO', next_review: '2026-01-01',
    domains: ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
  },
]

export default function CompliancePage() {
  const { data: frameworks = [], isLoading } = useQuery({
    queryKey: ['compliance-frameworks'],
    queryFn: () => complianceApi.frameworks().then((r) => r.data),
  })

  const display = frameworks.length > 0 ? frameworks : SAMPLE_FRAMEWORKS

  const totalControls   = display.reduce((a: number, f: any) => a + f.total_controls, 0)
  const totalCompliant  = display.reduce((a: number, f: any) => a + f.compliant_controls, 0)
  const totalGaps       = display.reduce((a: number, f: any) => a + f.nc_controls, 0)
  const avgScore        = Math.round(display.reduce((a: number, f: any) => a + f.score, 0) / display.length)

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Compliance Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-framework compliance posture and control monitoring</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add Framework
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Controls',    value: totalControls, color: '#06b6d4' },
          { label: 'Compliant',         value: totalCompliant, color: '#10b981' },
          { label: 'Gaps Identified',   value: totalGaps, color: '#ef4444' },
          { label: 'Avg Score',         value: `${avgScore}%`, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="bg-grc-card border border-grc-border rounded-xl p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Loading frameworks…</div>
      ) : (
        <div className="space-y-4">
          {display.map((f: any) => (
            <div key={f.id} className="bg-grc-card border border-grc-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{f.name}</h3>
                  <div className="flex gap-4 mt-1 text-[11px] text-slate-500">
                    <span>Owner: {f.owner}</span>
                    <span>Next review: {f.next_review}</span>
                  </div>
                </div>
                <span className="text-3xl font-extrabold" style={{ color: f.color }}>{f.score}%</span>
              </div>

              <div className="flex gap-4 mb-3 text-[12px]">
                <span className="text-green-400">✅ {f.compliant_controls} Compliant</span>
                <span className="text-amber-400">⚠️ {f.partial_controls} Partial</span>
                <span className="text-red-400">❌ {f.nc_controls} Non-compliant</span>
                <span className="text-slate-500">Total: {f.total_controls}</span>
              </div>

              <div className="h-2 bg-grc-bg3 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${f.score}%`, background: f.color }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(f.domains || []).map((d: string) => (
                  <span key={d} className="bg-grc-bg3 text-slate-400 text-[11px] px-2 py-0.5 rounded font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
