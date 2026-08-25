import { useState, useEffect, useMemo } from 'react'
import { Search, FlaskConical, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import { TI_PARTNER_CODES, C4_CODES, BETA_CODES, hasTaxa } from './utils/storeMappings'
import Header from './components/Header'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import StoreTable from './components/StoreTable'
import StoreDrawer from './components/StoreDrawer'
import Pagination from './components/Pagination'

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

const PER_PAGE = 20

const selectBase = 'h-9 w-40 px-3 text-xs font-medium border rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat'
const selectIdle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
const selectActive = 'bg-brand-50 border-brand-300 text-brand-700 shadow-sm shadow-brand-100/50'

const AGENT_PROFILES = {
  'admin.ti@grupooscar.com.br': { nome: 'Admin TI', cargo: 'Coordenador', iniciais: 'AT' },
  'consulta.ti@grupooscar.com.br': { nome: 'Consulta TI', cargo: 'Operador N1', iniciais: 'CT' },
}

function buildUserProfile(supaUser) {
  const email = supaUser.email || ''
  const known = AGENT_PROFILES[email.toLowerCase()]
  if (known) return { ...known, email }
  const meta = supaUser.user_metadata || {}
  const nome = meta.nome || meta.full_name || email.split('@')[0]
  const iniciais = nome.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  return { nome, email, cargo: meta.cargo || 'Operador', iniciais }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [lojas, setLojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('ativas')
  const [fornecedor, setFornecedor] = useState('')
  const [taxa, setTaxa] = useState('')
  const [betaActive, setBetaActive] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? buildUserProfile(session.user) : null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? buildUserProfile(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setLojas([])
      setLoading(false)
      return
    }
    async function fetchLojas() {
      setLoading(true)
      const { data, error } = await supabase.from('lojas').select('*')
      if (error) console.error('Erro ao buscar lojas:', error.message)
      else setLojas(deduplicateAndSort(data))
      setLoading(false)
    }
    fetchLojas()
  }, [user])

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
  }, [lojas, tab, search, filters, fornecedor, taxa, betaActive])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const currentPage = Math.min(page, totalPages || 1)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => { setPage(1) }, [tab, search, filters, fornecedor, taxa, betaActive])

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (fornecedor ? 1 : 0) + (taxa ? 1 : 0) + (betaActive ? 1 : 0)

  function clearAll() {
    setFilters({ uf: '', regional: '', diretor: '', unidade_negocio: '' })
    setFornecedor('')
    setTaxa('')
    setBetaActive(false)
  }

  const tabLabel = betaActive ? 'lojas BETA' : fornecedor === 'ti_partner' ? 'lojas TI Partner' : fornecedor === 'c4' ? 'lojas C4' : taxa === 'possui' ? 'lojas com taxa' : tab === 'ativas' ? 'lojas ativas' : tab === 'fechadas' ? 'lojas fechadas' : 'lojas'

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header user={user} onLogout={() => supabase.auth.signOut()} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 px-6 lg:px-8 py-6 overflow-x-hidden">
          {/* Title */}
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Lojas</h2>
              <p className="text-sm text-slate-400 mt-0.5">Gerencie todas as unidades da rede</p>
            </div>
            <span className="text-sm text-slate-500">
              <span className="text-lg font-bold text-slate-800">{filtered.length}</span>
              <span className="ml-1">{tabLabel}</span>
            </span>
          </div>

          {/* Search + Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade, CNPJ, unidade, diretor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow"
              />
            </div>

            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm shrink-0">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`h-8 px-4 rounded-md text-xs font-semibold transition-all ${
                    tab === key
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 ${tab === key ? 'text-brand-200' : 'text-slate-400'}`}>
                    {tabCounts[key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 py-2 px-1 mb-4">
            {/* Grupo 1: Localização */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">Localização</span>
            <Select value={filters.uf} onChange={v => setFilter('uf', v)} placeholder="UF" opts={options.uf} active={!!filters.uf} />
            <Select value={filters.regional} onChange={v => setFilter('regional', v)} placeholder="Regional" opts={options.regional} active={!!filters.regional} />
            <Select value={filters.diretor} onChange={v => setFilter('diretor', v)} placeholder="Diretor" opts={options.diretor} active={!!filters.diretor} />
            <Select value={filters.unidade_negocio} onChange={v => setFilter('unidade_negocio', v)} placeholder="Unidade" opts={options.unidade_negocio} active={!!filters.unidade_negocio} />

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Grupo 2: Operação */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">Operação</span>
            <Select
              value={fornecedor}
              onChange={v => { setFornecedor(v); setBetaActive(false) }}
              placeholder="Fornecedor"
              opts={[{ value: 'ti_partner', label: 'TI Partner' }, { value: 'c4', label: 'C4' }]}
              active={!!fornecedor}
            />
            <Select
              value={taxa}
              onChange={v => { setTaxa(v); setBetaActive(false) }}
              placeholder="Taxa"
              opts={[{ value: 'possui', label: 'Deslocamento' }]}
              active={!!taxa}
            />

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* BETA Pill */}
            <button
              onClick={() => { setBetaActive(prev => !prev); if (!betaActive) { setFornecedor(''); setTaxa(''); setTab('todas') } }}
              className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                betaActive
                  ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md shadow-amber-200/60'
                  : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 shadow-sm'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              BETA
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                betaActive ? 'bg-amber-600/20 text-amber-950' : 'bg-amber-100 text-amber-600'
              }`}>
                {BETA_CODES.size}
              </span>
            </button>

            {/* Clear All */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="h-9 inline-flex items-center gap-1 px-3 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-3 h-3" />
                Limpar filtros ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="mt-4 text-slate-500 text-sm">Carregando lojas...</p>
            </div>
          ) : (
            <>
              <StoreTable lojas={paginated} onSelect={setSelected} />
              <Pagination current={currentPage} total={totalPages} onPageChange={setPage} />
              <p className="text-center text-[11px] text-slate-400 mt-2">
                {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} de {filtered.length}
              </p>
            </>
          )}
        </main>
      </div>

      <StoreDrawer loja={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
