import { LogOut, Moon, Sun, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Logo from './Logo'

export default function Header({ user, onLogout, dark, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 dark:border-slate-800/50 shrink-0">
      <Logo size={40} showText />

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 cursor-pointer"
          title={dark ? 'Tema claro' : 'Tema escuro'}
        >
          <Sun className={`w-4 h-4 transition-colors ${dark ? 'text-slate-500' : 'text-amber-400'}`} />
          <div className="w-10 h-[22px] rounded-full bg-slate-700 relative transition-colors">
            <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${
              dark ? 'left-[22px] bg-indigo-400' : 'left-[3px] bg-amber-400'
            }`} />
          </div>
          <Moon className={`w-4 h-4 transition-colors ${dark ? 'text-indigo-400' : 'text-slate-500'}`} />
        </button>

        <div className="h-5 w-px bg-slate-700" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 py-1 pl-1 pr-2.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.iniciais || 'CT'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.nome || 'Consulta TI'}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-700">
                <p className="text-xs font-semibold text-white">{user?.nome || 'Consulta TI'}</p>
                <p className="text-[10px] text-slate-400">{user?.cargo || 'Operador'}</p>
              </div>
              {onLogout && (
                <button
                  onClick={() => { setMenuOpen(false); onLogout() }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
