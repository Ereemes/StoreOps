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
    <div className="flex items-center justify-between pt-4">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 text-xs text-slate-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all ${
                p === current
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        Próxima
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
