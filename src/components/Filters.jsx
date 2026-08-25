import { useMemo } from 'react'
import { Filter, X } from 'lucide-react'

const filterConfigs = [
  { key: 'uf', label: 'UF', field: 'uf', allLabel: 'Todas' },
  { key: 'unidade_negocio', label: 'Unidade', field: 'unidade_negocio', allLabel: 'Todas' },
  { key: 'diretor', label: 'Diretor', field: 'diretor', allLabel: 'Todos' },
  { key: 'regional', label: 'Regional', field: 'regional', allLabel: 'Todas' },
]

export default function Filters({ lojas, filters, onFilterChange }) {
  const optionsMap = useMemo(() => {
    const map = {}
    for (const { field } of filterConfigs) {
      map[field] = [...new Set(lojas.map(l => l[field]).filter(Boolean))].sort()
    }
    return map
  }, [lojas])

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-slate-400 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Filtros</span>
      </div>

      {filterConfigs.map(({ key, label, field, allLabel }) => {
        const isActive = Boolean(filters[key])
        return (
          <select
            key={key}
            value={filters[key] || ''}
            onChange={e => onFilterChange(key, e.target.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 ${
              isActive
                ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-sm shadow-brand-100/50'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
            }`}
          >
            <option value="">{label}: {allLabel}</option>
            {optionsMap[field]?.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )
      })}

      {activeCount > 0 && (
        <button
          onClick={() => filterConfigs.forEach(f => onFilterChange(f.key, ''))}
          className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
        >
          <X className="w-3 h-3" />
          Limpar ({activeCount})
        </button>
      )}
    </div>
  )
}
