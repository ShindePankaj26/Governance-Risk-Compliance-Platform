import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../hooks/useAuth'
import {
  LayoutDashboard, AlertTriangle, Building2, ShieldCheck,
  ClipboardList, FileText, Bot, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',         color: '#06b6d4' },
  { to: '/risks',     icon: AlertTriangle,   label: 'Risk Register',     color: '#ef4444', badge: '12' },
  { to: '/vendors',   icon: Building2,       label: 'Vendor Assessment', color: '#f59e0b', badge: '3' },
  { to: '/compliance',icon: ShieldCheck,     label: 'Compliance Tracker',color: '#10b981' },
  { to: '/audits',    icon: ClipboardList,   label: 'Audit Management',  color: '#3b82f6' },
  { to: '/policies',  icon: FileText,        label: 'Policy Management', color: '#8b5cf6' },
  { to: '/aigov',     icon: Bot,             label: 'AI Governance',     color: '#ec4899' },
]

export default function Layout() {
  const { fullName, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-grc-bg text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-grc-bg2 border-r border-grc-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-grc-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">GRC Platform</p>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Enterprise Suite</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase px-2 py-2 mt-1">
            Modules
          </p>
          {navItems.map(({ to, icon: Icon, label, color, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5 transition-all relative
                ${isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-grc-bg3 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/5 bottom-1/5 w-0.5 rounded-r bg-blue-400" />
                  )}
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <Icon size={15} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-grc-border">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-grc-bg3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {fullName?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{fullName || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
