import { Search } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { isBeta, hasTaxa, getFornecedor } from '../utils/storeMappings'

function CellValue({ value, fallback = 'Não Informado' }) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return <span className="text-slate-400 text-xs italic">{fallback}</span>
  }
  return value
}

export default function StoreTable({ lojas, onSelect }) {
  if (lojas.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-lg font-semibold text-slate-700">Nenhuma loja encontrada</p>
        <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros ou a busca.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Código</th>
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loja</th>
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Cidade · UF</th>
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Regional</th>
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Unidade</th>
            <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {lojas.map((loja, i) => (
            <tr
              key={loja.codigo}
              onClick={() => onSelect(loja)}
              className={`border-b border-slate-50 hover:bg-brand-50/40 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
            >
              <td className="px-4 py-3.5 align-top w-20">
                <span className="font-mono font-bold text-slate-500 text-sm">
                  {String(loja.codigo).padStart(3, '0')}
                </span>
              </td>
              <td className="px-4 py-3.5 align-top">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 leading-snug">{loja.nome_fantasia || '—'}</span>
                  {isBeta(loja.codigo) && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">BETA</span>
                  )}
                  {hasTaxa(loja.codigo) && (
                    <span className="bg-purple-50 text-purple-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-purple-200">Deslocamento</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-xs">{loja.razao_social}</div>
              </td>
              <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell align-top whitespace-nowrap">
                {loja.cidade || loja.uf
                  ? <>{loja.cidade || ''}{loja.uf && <span className="text-slate-400"> · {loja.uf}</span>}</>
                  : <CellValue value={null} />
                }
              </td>
              <td className="px-4 py-3.5 hidden lg:table-cell align-top">
                <div className="font-semibold text-slate-800 text-sm leading-snug">
                  <CellValue value={loja.regional} />
                </div>
                {loja.diretor && (
                  <div className="text-[11px] text-slate-400 mt-0.5">Dir: {loja.diretor}</div>
                )}
              </td>
              <td className="px-4 py-3.5 text-slate-600 text-sm hidden lg:table-cell align-top">
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
