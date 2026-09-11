import { NavLink } from 'react-router-dom'
import { Store, Phone, Users } from 'lucide-react'

const MODULES = [
  { to: '/lojas', label: 'Lojas', icon: Store },
  { to: '/contatos', label: 'Contatos', icon: Phone },
]

const ADMIN_MODULES = [
  { to: '/usuarios', label: 'Usuários', icon: Users },
]

export default function Sidebar({ isAdmin }) {
  const modules = isAdmin ? [...MODULES, ...ADMIN_MODULES] : MODULES

  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-3 shrink-0">
      <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] mb-3">Módulos</p>

      <nav className="space-y-1">
        {modules.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50 shadow-sm shadow-brand-100/50 dark:shadow-none'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
