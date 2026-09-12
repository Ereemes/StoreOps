import { Search, ChevronUp, ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { isBeta, isEcommerce } from '../utils/storeMappings'

function CellValue({ value, fallback = 'Não Informado' }) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return <span className="text-slate-400 dark:text-slate-600 text-xs italic">{fallback}</span>
  }
  return value
}

const COLUMNS = [
  { key: 'codigo', label: 'Código', className: 'w-20' },
  { key: 'nome_fantasia', label: 'Loja' },
  { key: 'cidade', label: 'Cidade · UF', className: 'hidden md:table-cell' },
  { key: 'regional', label: 'Regional', className: 'hidden lg:table-cell' },
  { key: 'unidade_negocio', label: 'Unidade', className: 'hidden lg:table-cell' },
  { key: 'status', label: 'Status' },
]

function SortIcon({ column, sort }) {
  if (sort.key !== column) return <ChevronDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
  return sort.dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-brand-500" />
    : <ChevronDown className="w-3 h-3 text-brand-500" />
}

export default function StoreTable({ lojas, onSelect, sort = {}, onSort }) {
  if (lojas.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Nenhuma loja encontrada</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Tente ajustar os filtros ou a busca.</p>
      </div>
    )
  }

  function handleSort(key) {
    if (!onSort) return
    onSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
    )
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none group ${col.className || ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon column={col.key} sort={sort} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lojas.map((loja, i) => (
            <tr
              key={loja.codigo}
              onClick={() => onSelect(loja)}
              className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-brand-50/40 dark:hover:bg-slate-800/70 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}
            >
              <td className="px-4 py-3.5 align-top w-20">
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400 text-sm">
                  {String(loja.codigo).padStart(3, '0')}
                </span>
              </td>
              <td className="px-4 py-3.5 align-top">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">{loja.nome_fantasia || '—'}</span>
                  {isBeta(loja.codigo) && (
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700/50">BETA</span>
                  )}
                  {isEcommerce(loja.codigo) && (
                    <span className="bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-700/50 whitespace-nowrap">E-COMMERCE</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block truncate max-w-xs">{loja.razao_social}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 md:hidden lg:hidden">
                  {(loja.cidade || loja.uf) && <span>{loja.cidade || ''}{loja.uf && ` · ${loja.uf}`}</span>}
                  {loja.regional && <span className="hidden max-lg:inline">{(loja.cidade || loja.uf) ? ' — ' : ''}{loja.regional}</span>}
                </div>
              </td>
              <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 hidden md:table-cell align-top whitespace-nowrap">
                {loja.cidade || loja.uf
                  ? <>{loja.cidade || ''}{loja.uf && <span className="text-slate-400 dark:text-slate-500"> · {loja.uf}</span>}</>
                  : <CellValue value={null} />
                }
              </td>
              <td className="px-4 py-3.5 hidden lg:table-cell align-top">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                  <CellValue value={loja.regional} />
                </div>
                {loja.diretor && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Dir: {loja.diretor}</div>
                )}
              </td>
              <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-sm hidden lg:table-cell align-top">
                <CellValue value={loja.unidade_negocio} />
              </td>
              <td className="px-4 py-3.5 align-top">
                <StatusBadge loja={loja} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
