import { useMemo } from 'react'
import { Store, MapPin, Users, TrendingUp, Building2, AlertTriangle } from 'lucide-react'
import { getStoreStatus } from '../utils/storeStatus'
import { isBeta, hasTaxa, TI_PARTNER_CODES, C4_CODES } from '../utils/storeMappings'

function Card({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colors[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  )
}

function DistributionBar({ items, total }) {
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
        {items.map(({ key, count, color }) => (
          count > 0 && (
            <div
              key={key}
              className={`${color} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          )
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
        {items.map(({ key, label, count, dotColor }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-xs text-slate-600">{label}</span>
            <span className="text-xs font-bold text-slate-800">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopList({ title, items }) {
  const max = items[0]?.count || 1
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.slice(0, 5).map(({ name, count }) => (
          <div key={name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700 font-medium truncate mr-2">{name}</span>
              <span className="text-slate-500 font-bold shrink-0">{count}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ lojas }) {
  const stats = useMemo(() => {
    const total = lojas.length
    const fechadas = lojas.filter(l => l.status === 'Fechada').length
    const ativas = total - fechadas

    let abertas = 0
    let foraHorario = 0
    let semHorario = 0
    for (const l of lojas) {
      const s = getStoreStatus(l)
      if (s.label === 'Aberta') abertas++
      else if (s.label === 'Fora do Horário') foraHorario++
      else if (s.label === 'Horário não informado') semHorario++
    }

    const beta = lojas.filter(l => isBeta(l.codigo)).length
    const comTaxa = lojas.filter(l => hasTaxa(l.codigo)).length
    const tiPartner = lojas.filter(l => TI_PARTNER_CODES.has(Number(l.codigo))).length
    const c4 = lojas.filter(l => C4_CODES.has(Number(l.codigo))).length

    const ufMap = {}
    const unidadeMap = {}
    const regionalMap = {}
    for (const l of lojas) {
      if (l.uf) ufMap[l.uf] = (ufMap[l.uf] || 0) + 1
      if (l.unidade_negocio) unidadeMap[l.unidade_negocio] = (unidadeMap[l.unidade_negocio] || 0) + 1
      if (l.regional) regionalMap[l.regional] = (regionalMap[l.regional] || 0) + 1
    }

    const toSorted = (map) => Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

    return { total, ativas, fechadas, abertas, foraHorario, semHorario, beta, comTaxa, tiPartner, c4, ufList: toSorted(ufMap), unidadeList: toSorted(unidadeMap), regionalList: toSorted(regionalMap) }
  }, [lojas])

  const statusItems = [
    { key: 'abertas', label: 'Abertas', count: stats.abertas, color: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
    { key: 'fora', label: 'Fora do Horário', count: stats.foraHorario, color: 'bg-amber-400', dotColor: 'bg-amber-400' },
    { key: 'fechadas', label: 'Fechadas', count: stats.fechadas, color: 'bg-red-400', dotColor: 'bg-red-400' },
    { key: 'sem', label: 'Sem Horário', count: stats.semHorario, color: 'bg-slate-300', dotColor: 'bg-slate-300' },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-400 mt-0.5">Visão geral das unidades da rede</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Total de Lojas" value={stats.total} subtitle={`${stats.ativas} ativas`} icon={Store} color="blue" />
        <Card title="Abertas Agora" value={stats.abertas} subtitle="em funcionamento" icon={TrendingUp} color="green" />
        <Card title="Lojas BETA" value={stats.beta} subtitle="em teste" icon={AlertTriangle} color="amber" />
        <Card title="Com Deslocamento" value={stats.comTaxa} subtitle={`${stats.tiPartner} TI Partner · ${stats.c4} C4`} icon={MapPin} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Status das Lojas</h3>
        <DistributionBar items={statusItems} total={stats.total} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopList title="Lojas por UF" items={stats.ufList} />
        <TopList title="Lojas por Unidade" items={stats.unidadeList} />
        <TopList title="Lojas por Regional" items={stats.regionalList} />
      </div>
    </div>
  )
}
