import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ current, total, onPageChange }) {
  if (total <= 1) return null

  const pages = []
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) pages.push(i)

  if (end < total) {
    if (end < total - 1) pages.push('...')
    pages.push(total)
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="inline-flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm dark:shadow-none"
        title="Anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1.5 text-xs text-slate-400 dark:text-slate-500">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all ${
              p === current
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-slate-600 cursor-pointer shadow-sm dark:shadow-none'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="inline-flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm dark:shadow-none"
        title="Próxima"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
