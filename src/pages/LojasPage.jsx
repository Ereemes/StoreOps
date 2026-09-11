import { useState, useEffect, useMemo } from 'react'
import { Search, FlaskConical, ShoppingCart, Building, Server, MapPin, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TI_PARTNER_CODES, C4_CODES, BETA_CODES, ECOMMERCE_CODES, hasTaxa, isEcommerce } from '../utils/storeMappings'
import StoreTable from '../components/StoreTable'
import StoreDrawer from '../components/StoreDrawer'
import Pagination from '../components/Pagination'

function deduplicateAndSort(data) {
  const seen = new Map()
  for (const loja of data) {
    const key = String(loja.codigo)
    if (!seen.has(key)) seen.set(key, loja)
  }
  return Array.from(seen.values()).sort((a, b) =>
    String(a.codigo).localeCompare(String(b.codigo), undefined, { numeric: true, sensitivity: 'base' })
  )
}

const TABS = [
  { key: 'ativas', label: 'Ativas' },
  { key: 'fechadas', label: 'Fechadas' },
  { key: 'todas', label: 'Todas' },
]

const PER_PAGE = 10

const selectBase = 'h-9 w-40 px-3 text-xs font-medium border rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat'
const selectIdle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-none'
const selectActive = 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400 shadow-sm shadow-brand-100/50 dark:shadow-none'

export default function LojasPage() {
  const [lojas, setLojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('ativas')
  const [fornecedor, setFornecedor] = useState('')
  const [taxa, setTaxa] = useState('')
  const [ecommerce, setEcommerce] = useState('')
  const [betaActive, setBetaActive] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchLojas() {
      setLoading(true)
      const { data, error } = await supabase.from('lojas').select('*')
      if (error) console.error('Erro ao buscar lojas:', error.message)
      else setLojas(deduplicateAndSort(data))
      setLoading(false)
    }
    fetchLojas()
  }, [])

  const options = useMemo(() => {
    const collect = (field, exclude = []) => [...new Set(lojas.map(l => l[field]).filter(v => v && !exclude.includes(v)))].sort()
    return { uf: collect('uf'), regional: collect('regional'), diretor: collect('diretor'), unidade_negocio: collect('unidade_negocio', ['Geral']) }
  }, [lojas])

  const tabCounts = useMemo(() => {
    const ativas = lojas.filter(l => l.status !== 'Fechada').length
    return { ativas, fechadas: lojas.length - ativas, todas: lojas.length }
  }, [lojas])

  const filtered = useMemo(() => {
    let result = lojas

    if (betaActive) return result.filter(l => BETA_CODES.has(Number(l.codigo)))

    if (tab === 'ativas') result = result.filter(l => l.status !== 'Fechada')
    else if (tab === 'fechadas') result = result.filter(l => l.status === 'Fechada')

    if (fornecedor === 'ti_partner') result = result.filter(l => TI_PARTNER_CODES.has(Number(l.codigo)))
    else if (fornecedor === 'c4') result = result.filter(l => C4_CODES.has(Number(l.codigo)))

    if (taxa === 'possui') result = result.filter(l => hasTaxa(l.codigo))

    if (ecommerce === 'ativo') result = result.filter(l => isEcommerce(l.codigo))

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(l =>
        [l.nome_fantasia, l.codigo, l.cidade, l.cnpj, l.diretor, l.regional]
          .some(v => v && String(v).toLowerCase().includes(q))
      )
    }

    if (filters.uf) result = result.filter(l => l.uf === filters.uf)
    if (filters.regional) result = result.filter(l => l.regional === filters.regional)
    if (filters.diretor) result = result.filter(l => l.diretor === filters.diretor)
    if (filters.unidade_negocio) result = result.filter(l => l.unidade_negocio === filters.unidade_negocio)

    return result
  }, [lojas, tab, search, filters, fornecedor, taxa, ecommerce, betaActive])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const currentPage = Math.min(page, totalPages || 1)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => { setPage(1) }, [tab, search, filters, fornecedor, taxa, ecommerce, betaActive])

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (fornecedor ? 1 : 0) + (taxa ? 1 : 0) + (ecommerce ? 1 : 0) + (betaActive ? 1 : 0)

  function clearAll() {
    setFilters({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
    setFornecedor('')
    setTaxa('')
    setEcommerce('')
    setBetaActive(false)
  }

  const tabLabel = betaActive ? 'lojas BETA' : ecommerce === 'ativo' ? 'lojas E-commerce' : fornecedor === 'ti_partner' ? 'lojas TI Partner' : fornecedor === 'c4' ? 'lojas C4' : taxa === 'possui' ? 'lojas com taxa' : tab === 'ativas' ? 'lojas ativas' : tab === 'fechadas' ? 'lojas fechadas' : 'lojas'

  function Select({ value, onChange, placeholder, opts, active }) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${selectBase} ${active ? selectActive : selectIdle}`}
      >
        <option value="">{placeholder}</option>
        {opts.map(v =>
          typeof v === 'string'
            ? <option key={v} value={v}>{v}</option>
            : <option key={v.value} value={v.value}>{v.label}</option>
        )}
      </select>
    )
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lojas</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Gerencie todas as unidades da rede</p>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{filtered.length}</span>
          <span className="ml-1">{tabLabel}</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, CNPJ, unidade, diretor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm dark:shadow-none shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`h-8 px-4 rounded-md text-xs font-semibold transition-all ${
                tab === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {label}
              <span className={`ml-1.5 ${tab === key ? 'text-brand-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {tabCounts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 py-2 px-1 mb-4">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">Localização</span>
        <Select value={filters.uf} onChange={v => setFilter('uf', v)} placeholder="UF" opts={options.uf} active={!!filters.uf} />
        <Select value={filters.regional} onChange={v => setFilter('regional', v)} placeholder="Regional" opts={options.regional} active={!!filters.regional} />
        <Select value={filters.diretor} onChange={v => setFilter('diretor', v)} placeholder="Diretor" opts={options.diretor} active={!!filters.diretor} />
        <Select value={filters.unidade_negocio} onChange={v => setFilter('unidade_negocio', v)} placeholder="Unidade" opts={options.unidade_negocio} active={!!filters.unidade_negocio} />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">Operação</span>

        <button
          onClick={() => { const next = ecommerce !== 'ativo'; setEcommerce(next ? 'ativo' : ''); if (next) { setFornecedor(''); setTaxa(''); setBetaActive(false); setTab('todas') } }}
          className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            ecommerce === 'ativo'
              ? 'bg-sky-400 border-sky-500 text-sky-950 shadow-md shadow-sky-200/60 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 shadow-sm dark:shadow-none'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          E-COMMERCE
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            ecommerce === 'ativo' ? 'bg-sky-600/20 text-sky-950' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
          }`}>
            {ECOMMERCE_CODES.size}
          </span>
        </button>

        <button
          onClick={() => { const next = fornecedor !== 'ti_partner'; setFornecedor(next ? 'ti_partner' : ''); if (next) { setEcommerce(''); setTaxa(''); setBetaActive(false); setTab('todas') } }}
          className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            fornecedor === 'ti_partner'
              ? 'bg-emerald-400 border-emerald-500 text-emerald-950 shadow-md shadow-emerald-200/60 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm dark:shadow-none'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          TI PARTNER
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            fornecedor === 'ti_partner' ? 'bg-emerald-600/20 text-emerald-950' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {TI_PARTNER_CODES.size}
          </span>
        </button>

        <button
          onClick={() => { const next = fornecedor !== 'c4'; setFornecedor(next ? 'c4' : ''); if (next) { setEcommerce(''); setTaxa(''); setBetaActive(false); setTab('todas') } }}
          className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            fornecedor === 'c4'
              ? 'bg-violet-400 border-violet-500 text-violet-950 shadow-md shadow-violet-200/60 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 shadow-sm dark:shadow-none'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          C4
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            fornecedor === 'c4' ? 'bg-violet-600/20 text-violet-950' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
          }`}>
            {C4_CODES.size}
          </span>
        </button>

        <button
          onClick={() => { const next = taxa !== 'possui'; setTaxa(next ? 'possui' : ''); if (next) { setEcommerce(''); setFornecedor(''); setBetaActive(false); setTab('todas') } }}
          className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            taxa === 'possui'
              ? 'bg-purple-400 border-purple-500 text-purple-950 shadow-md shadow-purple-200/60 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-sm dark:shadow-none'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          DESLOCAMENTO
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            taxa === 'possui' ? 'bg-purple-600/20 text-purple-950' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          }`}>
            {TI_PARTNER_CODES.size + C4_CODES.size}
          </span>
        </button>

        <button
          onClick={() => { setBetaActive(prev => !prev); if (!betaActive) { setFornecedor(''); setTaxa(''); setEcommerce(''); setTab('todas') } }}
          className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            betaActive
              ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md shadow-amber-200/60 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm dark:shadow-none'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          BETA
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            betaActive ? 'bg-amber-600/20 text-amber-950' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }`}>
            {BETA_CODES.size}
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="h-9 inline-flex items-center gap-1 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer ml-auto"
          >
            <X className="w-3 h-3" />
            Limpar filtros ({activeFilterCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-200 dark:border-brand-800 border-t-brand-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Carregando lojas...</p>
        </div>
      ) : (
        <>
          <StoreTable lojas={paginated} onSelect={setSelected} />
          <Pagination current={currentPage} total={totalPages} onPageChange={setPage} />
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} de {filtered.length}
          </p>
        </>
      )}

      <StoreDrawer loja={selected} onClose={() => setSelected(null)} />
    </>
  )
}
