import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, FlaskConical, ShoppingCart, Building, Server, Map as MapIcon, Users, UserStar, Store, X, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TI_PARTNER_CODES, C4_CODES, BETA_CODES, ECOMMERCE_CODES, isEcommerce } from '../utils/storeMappings'
import { getStoreStatus } from '../utils/storeStatus'
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

const PER_PAGE = 15

function ChipSelect({ value, onChange, placeholder, opts, icon: Icon }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])

  const items = opts.map(v => typeof v === 'string' ? { value: v, label: v } : v)
  const filtered = query ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())) : items

  if (value) {
    return (
      <span className="h-8 inline-flex items-center gap-1.5 pl-3 pr-1.5 rounded-full text-xs font-semibold bg-brand-500/15 dark:bg-brand-400/15 text-brand-700 dark:text-brand-300 border border-brand-400/30 dark:border-brand-500/30">
        <Icon className="w-3.5 h-3.5" />
        {value}
        <button
          onClick={e => { e.stopPropagation(); onChange('') }}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-500/20 dark:bg-brand-400/20 text-brand-600 dark:text-brand-300 ml-0.5 hover:bg-brand-500/40 dark:hover:bg-brand-400/30 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setQuery('') }}
        className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
          open
            ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200'
            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{placeholder}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-black/30 z-50 overflow-hidden">
          {items.length > 6 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full h-7 pl-7 pr-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">Nenhum resultado</p>
            ) : (
              filtered.map(item => (
                <button
                  key={item.value}
                  onClick={() => { onChange(item.value); setOpen(false); setQuery('') }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  {value === item.value ? (
                    <span className="w-3 h-3 rounded-full bg-brand-500 flex items-center justify-center"><span className="w-1.5 h-1.5 bg-white rounded-full" /></span>
                  ) : (
                    <Icon className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  )}
                  {item.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LojasPage() {
  const [lojas, setLojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('ativas')
  const [fornecedor, setFornecedor] = useState('')
  const [ecommerce, setEcommerce] = useState('')
  const [betaActive, setBetaActive] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
  const [selected, setSelected] = useState(null)
  const [sort, setSort] = useState({ key: '', dir: 'asc' })

  useEffect(() => {
    async function fetchLojas() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('lojas').select('*')
        if (error) console.error('Erro ao buscar lojas:', error.message)
        else setLojas(deduplicateAndSort(data))
      } catch (err) {
        console.error('Erro ao buscar lojas:', err)
      } finally {
        setLoading(false)
      }
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

    if (ecommerce === 'ativo') result = result.filter(l => isEcommerce(l.codigo))

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(l =>
        [l.nome_fantasia, l.codigo, l.cidade, l.cnpj, l.diretor, l.regional, l.unidade_negocio]
          .some(v => v && String(v).toLowerCase().includes(q))
      )
    }

    if (filters.uf) result = result.filter(l => l.uf === filters.uf)
    if (filters.regional) result = result.filter(l => l.regional === filters.regional)
    if (filters.diretor) result = result.filter(l => l.diretor === filters.diretor)
    if (filters.unidade_negocio) result = result.filter(l => l.unidade_negocio === filters.unidade_negocio)

    return result
  }, [lojas, tab, search, filters, fornecedor, ecommerce, betaActive])

  const sorted = useMemo(() => {
    if (!sort.key) return filtered
    return [...filtered].sort((a, b) => {
      const av = sort.key === 'status' ? getStoreStatus(a).label.toLowerCase() : String(a[sort.key] || '').toLowerCase()
      const bv = sort.key === 'status' ? getStoreStatus(b).label.toLowerCase() : String(b[sort.key] || '').toLowerCase()
      const cmp = av.localeCompare(bv, 'pt-BR', { numeric: true, sensitivity: 'base' })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort])

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const currentPage = Math.min(page, totalPages || 1)
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => { setPage(1) }, [tab, search, filters, fornecedor, ecommerce, betaActive])

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (fornecedor ? 1 : 0) + (ecommerce ? 1 : 0) + (betaActive ? 1 : 0)

  function clearAll() {
    setFilters({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
    setFornecedor('')
    setEcommerce('')
    setBetaActive(false)
    setTab('ativas')
  }

  const tabLabel = betaActive ? 'lojas BETA' : ecommerce === 'ativo' ? 'lojas E-commerce' : fornecedor === 'ti_partner' ? 'lojas TI Partner' : fornecedor === 'c4' ? 'lojas C4' : tab === 'ativas' ? 'lojas ativas' : tab === 'fechadas' ? 'lojas fechadas' : 'lojas'

  return (
    <>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Lojas
          {(filters.uf || filters.regional || filters.diretor || filters.unidade_negocio || fornecedor || ecommerce === 'ativo' || betaActive) && (
            <span className="text-slate-400 dark:text-slate-500 font-semibold text-lg ml-2">
              {'› '}
              {betaActive ? 'BETA' : ecommerce === 'ativo' ? 'E-Commerce' : fornecedor === 'ti_partner' ? 'TI Partner' : fornecedor === 'c4' ? 'C4' : ''}
              {(betaActive || ecommerce === 'ativo' || fornecedor) && (filters.uf || filters.regional || filters.diretor || filters.unidade_negocio) ? ' · ' : ''}
              {[filters.uf, filters.regional, filters.diretor, filters.unidade_negocio].filter(Boolean).join(' · ')}
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Gerencie todas as unidades da rede</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome, cidade, CNPJ, unidade, diretor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow"
        />
      </div>

      <div className="space-y-2 py-2 px-1 mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">Localização</span>
          <ChipSelect value={filters.uf} onChange={v => setFilter('uf', v)} placeholder="UF" opts={options.uf} icon={MapIcon} />
          <ChipSelect value={filters.regional} onChange={v => setFilter('regional', v)} placeholder="Regional" opts={options.regional} icon={Users} />
          <ChipSelect value={filters.diretor} onChange={v => setFilter('diretor', v)} placeholder="Diretor" opts={options.diretor} icon={UserStar} />
          <ChipSelect value={filters.unidade_negocio} onChange={v => setFilter('unidade_negocio', v)} placeholder="Unidade" opts={options.unidade_negocio} icon={Store} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">Operação</span>

          <button
            onClick={() => { const next = ecommerce !== 'ativo'; setEcommerce(next ? 'ativo' : ''); if (next) { setFornecedor(''); setBetaActive(false); setTab('todas') } }}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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
            onClick={() => { const next = fornecedor !== 'ti_partner'; setFornecedor(next ? 'ti_partner' : ''); if (next) { setEcommerce(''); setBetaActive(false); setTab('todas') } }}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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
            onClick={() => { const next = fornecedor !== 'c4'; setFornecedor(next ? 'c4' : ''); if (next) { setEcommerce(''); setBetaActive(false); setTab('todas') } }}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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
            onClick={() => { setBetaActive(prev => !prev); if (!betaActive) { setFornecedor(''); setEcommerce(''); setTab('todas') } }}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-4 pb-1">
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 -mb-px ${
                tab === key
                  ? 'border-brand-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {label}
              <span className={`ml-1.5 ${tab === key ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`}>
                {tabCounts[key]}
              </span>
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          Exibindo <span className="text-slate-700 dark:text-slate-200 font-semibold">{filtered.length}</span> {tabLabel}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-200 dark:border-brand-800 border-t-brand-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Carregando lojas...</p>
        </div>
      ) : (
        <div key={`${tab}-${fornecedor}-${ecommerce}-${betaActive}-${filters.uf}-${filters.regional}-${filters.diretor}-${filters.unidade_negocio}`} className="animate-fade-in">
          <StoreTable lojas={paginated} onSelect={setSelected} sort={sort} onSort={setSort} />
          <Pagination current={currentPage} total={totalPages} onPageChange={setPage} />
          {filtered.length > 0 && (
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} de {filtered.length}
            </p>
          )}
        </div>
      )}

      <StoreDrawer loja={selected} onClose={() => setSelected(null)} />
    </>
  )
}
