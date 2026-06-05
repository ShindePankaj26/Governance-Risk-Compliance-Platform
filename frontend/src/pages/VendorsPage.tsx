import { useQuery } from '@tanstack/react-query'
import { vendorsApi } from '../utils/api'

const SAMPLE_VENDORS = [
  { id:1, name:'CloudVault Inc.',      tier:'Tier 1', data_sensitivity:'Critical', trust_score:42, risk_level:'High',   iso_certified:false, soc2_certified:false, pen_test_done:false, last_assessed:'2025-05-01' },
  { id:2, name:'DataSafe Analytics',   tier:'Tier 1', data_sensitivity:'High',     trust_score:75, risk_level:'Medium', iso_certified:true,  soc2_certified:false, pen_test_done:true,  last_assessed:'2025-04-15' },
  { id:3, name:'SecurePay Gateway',    tier:'Tier 1', data_sensitivity:'Critical', trust_score:88, risk_level:'Low',    iso_certified:true,  soc2_certified:true,  pen_test_done:true,  last_assessed:'2025-03-20' },
  { id:4, name:'HRConnect HRMS',       tier:'Tier 2', data_sensitivity:'High',     trust_score:71, risk_level:'Medium', iso_certified:true,  soc2_certified:false, pen_test_done:true,  last_assessed:'2025-02-10' },
  { id:5, name:'OmniLogistics Ltd.',   tier:'Tier 2', data_sensitivity:'Medium',   trust_score:55, risk_level:'High',   iso_certified:false, soc2_certified:false, pen_test_done:false, last_assessed:'2024-12-01' },
  { id:6, name:'TechNova Cloud',       tier:'Tier 3', data_sensitivity:'Low',      trust_score:91, risk_level:'Low',    iso_certified:true,  soc2_certified:true,  pen_test_done:true,  last_assessed:'2025-05-10' },
  { id:7, name:'PayBridge Solutions',  tier:'Tier 1', data_sensitivity:'Critical', trust_score:63, risk_level:'Medium', iso_certified:true,  soc2_certified:false, pen_test_done:false, last_assessed:'2025-01-20' },
  { id:8, name:'NexusAI Platform',     tier:'Tier 2', data_sensitivity:'High',     trust_score:48, risk_level:'High',   iso_certified:false, soc2_certified:false, pen_test_done:true,  last_assessed:'2025-03-05' },
  { id:9, name:'SwiftDelivery Corp.',  tier:'Tier 3', data_sensitivity:'Low',      trust_score:82, risk_level:'Low',    iso_certified:true,  soc2_certified:true,  pen_test_done:true,  last_assessed:'2025-04-28' },
]

function scoreColor(score: number) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function CertBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="bg-grc-bg3 rounded-md p-2 text-center">
      <div className="text-base">{ok ? '✅' : '❌'}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function VendorsPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.list().then((r) => r.data),
  })

  const displayVendors = vendors.length > 0 ? vendors : SAMPLE_VENDORS

  const stats = [
    { label: 'Total Vendors',        value: displayVendors.length, color: '#06b6d4' },
    { label: 'High Risk',            value: displayVendors.filter((v: any) => v.risk_level === 'High').length, color: '#ef4444' },
    { label: 'Assessments Pending',  value: 8, color: '#f59e0b' },
    { label: 'Avg Trust Score',      value: Math.round(displayVendors.reduce((a: number, v: any) => a + v.trust_score, 0) / displayVendors.length), color: '#10b981' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Vendor Assessment</h1>
          <p className="text-slate-400 text-sm mt-1">Third-party risk and security posture management</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + Add Vendor
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
        <div className="text-center text-slate-500 py-12">Loading vendors…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayVendors.map((v: any) => (
            <div key={v.id} className="bg-grc-card border border-grc-border rounded-xl p-5 hover:border-grc-border2 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-sm text-white">{v.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{v.tier} · Data: {v.data_sensitivity}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  v.risk_level === 'Low' ? 'bg-green-500/15 text-green-400' :
                  v.risk_level === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>{v.risk_level}</span>
              </div>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-extrabold" style={{ color: scoreColor(v.trust_score) }}>
                  {v.trust_score}
                </span>
                <span className="text-xs text-slate-500 mb-1">/ 100 Trust Score</span>
              </div>
              <div className="h-1.5 bg-grc-bg3 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${v.trust_score}%`, background: scoreColor(v.trust_score) }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <CertBadge label="ISO 27001" ok={v.iso_certified} />
                <CertBadge label="SOC 2" ok={v.soc2_certified} />
                <CertBadge label="Pen Test" ok={v.pen_test_done} />
              </div>
              <p className="text-[11px] text-slate-500">Last assessed: {v.last_assessed}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
