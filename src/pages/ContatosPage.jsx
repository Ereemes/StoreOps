import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Phone, Crown, Users, ChevronDown, ChevronUp, Store, MessageCircle } from 'lucide-react'

const DIRETORES = [
  { nome: 'CERUTTI', telefone: '(27) 99279-0408' },
  { nome: 'ERICSON', telefone: '(17) 99775-4692' },
  { nome: 'HELENA', telefone: '' },
  { nome: 'RENAN', telefone: '(11) 97271-3443' },
  { nome: 'SONIA', telefone: '(12) 99169-5227' },
]

const REGIONAIS = [
  { nome: 'ARTEMIS', telefone: '(11) 94782-9473', diretor: 'HELENA', lojas: 15 },
  { nome: 'BERNARDO', telefone: '(51) 8185-4157', diretor: 'CERUTTI', lojas: 20 },
  { nome: 'CLAUDIO', telefone: '(16) 99766-1341', diretor: 'ERICSON', lojas: 5 },
  { nome: 'CLOVIS', telefone: '(51) 9758-3057', diretor: 'CERUTTI', lojas: 19 },
  { nome: 'ESTEFAN', telefone: '(12) 99673-8581', diretor: 'ERICSON', lojas: 8 },
  { nome: 'JOÃO PAULO', telefone: '(12) 97407-6992', diretor: 'ERICSON', lojas: 7 },
  { nome: 'JORGE', telefone: '(51) 8151-8388', diretor: 'CERUTTI', lojas: 11 },
  { nome: 'KATIANE', telefone: '(47) 9162-5401', diretor: 'CERUTTI', lojas: 6 },
  { nome: 'LUIGI', telefone: '(19) 99278-9054', diretor: 'ERICSON', lojas: 6 },
  { nome: 'LUIS AMERICO', telefone: '(12) 97405-4274', diretor: 'ERICSON', lojas: 8 },
  { nome: 'MAURICIO', telefone: '(11) 94700-3947', diretor: 'ERICSON', lojas: 8 },
  { nome: 'PATRICIA', telefone: '(51) 8158-4666', diretor: 'CERUTTI', lojas: 23 },
  { nome: 'PETERSON', telefone: '(12) 98143-4435', diretor: 'ERICSON', lojas: 5 },
  { nome: 'RODRIGO', telefone: '(16) 97400-1375', diretor: 'ERICSON', lojas: 7 },
  { nome: 'ROGERS', telefone: '(17) 99732-7460', diretor: 'ERICSON', lojas: 7 },
  { nome: 'SEWERYNO', telefone: '(71) 8401-0333', diretor: '', lojas: 9 },
  { nome: 'SUILA', telefone: '', diretor: 'SONIA', lojas: 2 },
  { nome: 'THIAGO', telefone: '(24) 99916-5013', diretor: 'ERICSON', lojas: 15 },
  { nome: 'VIVIANE', telefone: '', diretor: 'SONIA', lojas: 4 },
]

function formatWhatsAppUrl(telefone) {
  if (!telefone) return null
  const digits = telefone.replace(/\D/g, '')
  return `https://wa.me/55${digits}`
}

function getInitials(nome) {
  if (nome === 'Sem diretor') return '?'
  return nome.split(' ').map(w => w[0]).join('').substring(0, 2)
}

function DiretorCard({ diretor, regionaisCount }) {
  const waUrl = formatWhatsAppUrl(diretor.telefone)
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
        {getInitials(diretor.nome)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{diretor.nome}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Diretor · {regionaisCount} regionais</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {diretor.telefone ? (
          <>
            <a
              href={`tel:${diretor.telefone}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {diretor.telefone}
            </a>
            <a
              href={`tel:${diretor.telefone}`}
              className="sm:hidden inline-flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
              title="Ligar"
            >
              <Phone className="w-4 h-4" />
            </a>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-600 italic px-2">Sem telefone</span>
        )}
      </div>
    </div>
  )
}

function RegionalCard({ regional, navigate }) {
  const waUrl = formatWhatsAppUrl(regional.telefone)
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-400 shrink-0">
          {getInitials(regional.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{regional.nome}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{regional.lojas} lojas</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {regional.telefone ? (
            <>
              <a
                href={`tel:${regional.telefone}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-lg transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">{regional.telefone}</span>
                <span className="sm:hidden">Ligar</span>
              </a>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-7 h-7 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-600 italic">Sem telefone</span>
          )}
        </div>
        <button
          onClick={() => navigate(`/lojas?regional=${encodeURIComponent(regional.nome)}`)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-700/50 rounded-lg transition-colors cursor-pointer"
        >
          <Store className="w-3 h-3" />
          Ver lojas
        </button>
      </div>
    </div>
  )
}

export default function ContatosPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [showDiretores, setShowDiretores] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  const filteredDiretores = useMemo(() => {
    if (!search.trim()) return DIRETORES
    const q = search.toLowerCase().trim()
    return DIRETORES.filter(d => d.nome.toLowerCase().includes(q) || d.telefone.includes(q))
  }, [search])

  const filteredRegionais = useMemo(() => {
    if (!search.trim()) return REGIONAIS
    const q = search.toLowerCase().trim()
    return REGIONAIS.filter(r =>
      r.nome.toLowerCase().includes(q) ||
      r.telefone.includes(q) ||
      r.diretor.toLowerCase().includes(q)
    )
  }, [search])

  const regionaisByDiretor = useMemo(() => {
    const groups = {}
    for (const r of filteredRegionais) {
      const dir = r.diretor || 'Sem diretor'
      if (!groups[dir]) groups[dir] = { regionais: [], totalLojas: 0 }
      groups[dir].regionais.push(r)
      groups[dir].totalLojas += r.lojas
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
  }, [filteredRegionais])

  const regionaisCountByDiretor = useMemo(() => {
    const counts = {}
    for (const r of REGIONAIS) {
      const dir = r.diretor || 'Sem diretor'
      counts[dir] = (counts[dir] || 0) + 1
    }
    return counts
  }, [])

  useEffect(() => {
    if (regionaisByDiretor.length > 0 && Object.keys(expandedGroups).length === 0) {
      setExpandedGroups(Object.fromEntries(regionaisByDiretor.map(([dir]) => [dir, true])))
    }
  }, [regionaisByDiretor])

  function toggleGroup(dir) {
    setExpandedGroups(prev => ({ ...prev, [dir]: !prev[dir] }))
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contatos</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Telefones dos regionais e diretores</p>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{REGIONAIS.length}</span>
          <span className="ml-1">regionais</span>
          <span className="text-slate-300 dark:text-slate-600 mx-2">&middot;</span>
          <span className="text-lg font-bold text-slate-800 dark:text-white">{DIRETORES.length}</span>
          <span className="ml-1">diretores</span>
        </span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou diretor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow"
        />
      </div>

      {(filteredDiretores.length > 0 || filteredRegionais.length > 0) && (
        <button
          onClick={() => setShowDiretores(prev => !prev)}
          className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Crown className="w-4 h-4" />
          Diretores ({filteredDiretores.length})
          {showDiretores ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      {showDiretores && filteredDiretores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
          {filteredDiretores.map(d => (
            <DiretorCard key={d.nome} diretor={d} regionaisCount={regionaisCountByDiretor[d.nome] || 0} />
          ))}
        </div>
      )}

      {filteredRegionais.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Regionais ({filteredRegionais.length})
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">agrupados por diretor</span>
        </div>
      )}

      {regionaisByDiretor.map(([dir, group]) => (
        <div key={dir} className="mb-4">
          <button
            onClick={() => toggleGroup(dir)}
            className="w-full flex items-center gap-2.5 py-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {getInitials(dir)}
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dir}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">— {group.regionais.length} regionais · {group.totalLojas} lojas</span>
            {expandedGroups[dir]
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-auto" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-auto" />
            }
          </button>

          {expandedGroups[dir] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.regionais.map(r => (
                <RegionalCard key={r.nome} regional={r} navigate={navigate} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-8">
              {group.regionais.map(r => r.nome).join(', ')}
            </p>
          )}
        </div>
      ))}

      {filteredRegionais.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Nenhum contato encontrado</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Tente ajustar a busca.</p>
        </div>
      )}
    </>
  )
}
