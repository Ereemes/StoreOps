import { Store } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-slate-200 bg-white py-5 px-3 shrink-0">
      <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">Módulos</p>

      <nav className="space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-50 text-brand-700 border border-brand-100 shadow-sm shadow-brand-100/50 transition-all">
          <Store className="w-[18px] h-[18px]" />
          Lojas
        </button>
      </nav>
    </aside>
  )
}
