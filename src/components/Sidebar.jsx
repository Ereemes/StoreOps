import { NavLink } from 'react-router-dom'
import { Store, Tv, Phone } from 'lucide-react'

const MODULES = [
  { to: '/lojas', label: 'Lojas', icon: Store },
  { to: '/contatos', label: 'Contatos', icon: Phone },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-slate-200 bg-white py-5 px-3 shrink-0">
      <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">Módulos</p>

      <nav className="space-y-1">
        {MODULES.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm shadow-brand-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={() => window.open('/tv/sefaz', '_blank')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent transition-all"
        >
          <Tv className="w-[18px] h-[18px]" />
          Modo TV
        </button>
      </div>
    </aside>
  )
}
