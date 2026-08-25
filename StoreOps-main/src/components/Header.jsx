import { LogOut } from 'lucide-react'
import Logo from './Logo'

export default function Header({ user, onLogout }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <Logo size={38} />
        <div>
          <span className="text-base font-bold text-white tracking-tight">Store</span>
          <span className="text-base font-bold text-red-400 tracking-tight"> Ops</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center text-sm">
        <span className="text-slate-500">Grupo Oscar</span>
        <span className="text-slate-600 mx-2">·</span>
        <span className="text-slate-500">TI</span>
        <span className="text-slate-600 mx-2">·</span>
        <span className="font-semibold text-white">Lojas</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            {user?.iniciais || 'CT'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.nome || 'Consulta TI'}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.cargo || 'Operador'}</p>
          </div>
        </div>

        {onLogout && (
          <>
            <div className="h-6 w-px bg-slate-700" />
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
