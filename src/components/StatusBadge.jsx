import { getStoreStatus } from '../utils/storeStatus'

const styleMap = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  orange: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gray: 'bg-slate-50 text-slate-500 ring-slate-500/20',
}

const dotMap = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  orange: 'bg-amber-500',
  gray: 'bg-slate-400',
}

export default function StatusBadge({ loja }) {
  const { label, color } = getStoreStatus(loja)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset ${styleMap[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]} animate-pulse`} style={{ animationDuration: color === 'green' ? '2s' : '0s' }} />
      {label}
    </span>
  )
}
