import { Store, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getStoreStatus } from '../utils/storeStatus'

export default function KpiCards({ lojas }) {
  const total = lojas.length
  const counts = { green: 0, orange: 0, red: 0, gray: 0 }
  for (const loja of lojas) {
    const { color } = getStoreStatus(loja)
    counts[color]++
  }

  const cards = [
    {
      label: 'Total de Lojas',
      value: total,
      icon: Store,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      accent: 'border-l-slate-400',
    },
    {
      label: 'Abertas Agora',
      value: counts.green,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'border-l-emerald-500',
    },
    {
      label: 'Fora do Horário',
      value: counts.orange,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'border-l-amber-500',
    },
    {
      label: 'Fechadas',
      value: counts.red + counts.gray,
      icon: XCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      accent: 'border-l-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
        <div
          key={label}
          className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accent} p-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
