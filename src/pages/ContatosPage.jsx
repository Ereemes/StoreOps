import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Phone, User, Users, ChevronDown, ChevronUp } from 'lucide-react'

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

function ContactCard({ nome, telefone, role, extra }) {
  const waUrl = formatWhatsAppUrl(telefone)
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
            role === 'diretor' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-brand-400 to-brand-600'
          }`}>
            {nome.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{nome}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role === 'diretor' ? 'Diretor' : 'Regional'}</p>
            {extra && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{extra}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {telefone ? (
            <>
              <a
                href={`tel:${telefone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {telefone}
              </a>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-600 italic px-3 py-1.5">Sem telefone</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ContatosPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [showDiretores, setShowDiretores] = useState(true)
  const [filterDiretor, setFilterDiretor] = useState('')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  const diretoresUnicos = useMemo(() => [...new Set(REGIONAIS.map(r => r.diretor).filter(Boolean))].sort(), [])

  const filteredRegionais = useMemo(() => {
    let result = REGIONAIS
    if (filterDiretor) result = result.filter(r => r.diretor === filterDiretor)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(r =>
        r.nome.toLowerCase().includes(q) ||
        r.telefone.includes(q) ||
        r.diretor.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, filterDiretor])

  const filteredDiretores = useMemo(() => {
    if (!search.trim()) return DIRETORES
    const q = search.toLowerCase().trim()
    return DIRETORES.filter(d => d.nome.toLowerCase().includes(q) || d.telefone.includes(q))
  }, [search])

  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contatos</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Telefones dos regionais e diretores</p>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{REGIONAIS.length}</span>
          <span className="ml-1">regionais</span>
          <span className="text-slate-300 dark:text-slate-600 mx-2">&middot;</span>
          <span className="text-lg font-bold text-slate-800 dark:text-white">{DIRETORES.length}</span>
          <span className="ml-1">diretores</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow"
          />
        </div>
        <select
          value={filterDiretor}
          onChange={e => setFilterDiretor(e.target.value)}
          className="h-9 w-48 px-3 text-xs font-medium border rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-none"
        >
          <option value="">Todos os diretores</option>
          {diretoresUnicos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <button
        onClick={() => setShowDiretores(prev => !prev)}
        className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <User className="w-4 h-4" />
        Diretores ({filteredDiretores.length})
        {showDiretores ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showDiretores && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
          {filteredDiretores.map(d => (
            <ContactCard key={d.nome} nome={d.nome} telefone={d.telefone} role="diretor" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Regionais ({filteredRegionais.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredRegionais.map(r => (
          <ContactCard
            key={r.nome}
            nome={r.nome}
            telefone={r.telefone}
            role="regional"
            extra={`${r.diretor ? `Dir. ${r.diretor} · ` : ''}${r.lojas} lojas`}
          />
        ))}
      </div>

      {filteredRegionais.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 dark:text-slate-500 text-sm">Nenhum regional encontrado.</p>
        </div>
      )}
    </>
  )
}
