import { getStoreStatus } from '../utils/storeStatus'

const styleMap = {
  green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20',
  blue: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 ring-sky-600/20',
  orange: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-600/20',
  gray: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-500/20',
}

const dotMap = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-sky-500',
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
