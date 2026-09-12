import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Phone, MessageCircle, Mail, MapPin, Clock, Building2, Users, Copy, Check, Store, UserRound, ExternalLink } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { isBeta, hasTaxa, getFornecedor } from '../utils/storeMappings'

function formatPhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) return null
  return digits
}

function formatTime(time) {
  if (!time) return null
  return time.substring(0, 5)
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoCell({ label, value, span2, onClick }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">{label}</p>
      {onClick && value ? (
        <button
          onClick={onClick}
          className="text-sm text-brand-600 dark:text-brand-400 font-semibold hover:underline cursor-pointer text-left"
        >
          {value}
        </button>
      ) : (
        <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">{value || '—'}</p>
      )}
    </div>
  )
}

function CepBadge({ cep }) {
  const [copied, setCopied] = useState(false)

  if (!cep) return null

  function handleCopy() {
    navigator.clipboard.writeText(cep).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">CEP: {cep}</span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-all"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copiar CEP
          </>
        )}
      </button>
    </div>
  )
}

function isDuplicate(a, b) {
  if (!a || !b) return false
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalize(a) === normalize(b)
}

function EmailRow({ label, email, icon: Icon }) {
  const [copied, setCopied] = useState(false)

  if (!email) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 italic">Não cadastrado</p>
        </div>
      </div>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-violet-500 dark:text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold break-all leading-relaxed">{email}</p>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
        title="Copiar e-mail"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        )}
      </button>
    </div>
  )
}

function EmailPopover({ loja }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const emailLoja = loja.email_loja || null
  const emailGerente = loja.email_gerente || null
  const hasAny = emailLoja || emailGerente

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const allEmails = [emailLoja, emailGerente].filter(Boolean).join(',')

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
          open
            ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300'
            : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40'
        }`}
      >
        <Mail className="w-3.5 h-3.5" />
        E-mail
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">E-mails da Loja</p>
          </div>

          <div className="px-2 pb-2 space-y-1">
            <EmailRow label="E-mail da Loja" email={emailLoja} icon={Store} />
            <EmailRow label="E-mail do Gerente" email={emailGerente} icon={UserRound} />
          </div>

          {hasAny && (
            <div className="border-t border-slate-100 dark:border-slate-700 px-3 py-2.5">
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(allEmails)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                <Mail className="w-3.5 h-3.5" />
                Abrir no Gmail
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function StoreDrawer({ loja, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!loja) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [loja, onClose])

  if (!loja) return null

  function goToContato(nome) {
    onClose()
    navigate(`/contatos?q=${encodeURIComponent(nome)}`)
  }

  const phone = formatPhone(loja.telefone)
  const whatsapp = formatPhone(loja.whatsapp)
  const abertura = formatTime(loja.hora_abertura)
  const fechamento = formatTime(loja.hora_fechamento)

  const complemento = isDuplicate(loja.complemento, loja.logradouro) ? null : loja.complemento

  let addressLine = loja.logradouro || ''
  if (loja.numero) addressLine += `, ${loja.numero}`
  if (complemento) addressLine += ` - ${complemento}`

  const bairroCityParts = []
  if (loja.bairro) bairroCityParts.push(loja.bairro)
  const cityUf = [loja.cidade, loja.uf].filter(Boolean).join('/')
  if (cityUf) bairroCityParts.push(cityUf)
  const bairroCityLine = bairroCityParts.join(' — ')

  const hasAddress = addressLine.trim() || bairroCityLine

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto animate-slide-in-right border-l border-slate-200 dark:border-slate-800">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                  {String(loja.codigo).padStart(3, '0')}
                </span>
                <StatusBadge loja={loja} />
                {isBeta(loja.codigo) && (
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700/50">BETA</span>
                )}
                {hasTaxa(loja.codigo) && (
                  <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-700/50">
                    {getFornecedor(loja.codigo)}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 truncate">{loja.nome_fantasia}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{loja.razao_social}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-3 shrink-0">
              <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {whatsapp ? (
              <a
                href={`https://wa.me/55${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            ) : (
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-semibold cursor-not-allowed">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </span>
            )}
            {phone ? (
              <a
                href={`tel:+55${phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Ligar
              </a>
            ) : (
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-semibold cursor-not-allowed">
                <Phone className="w-3.5 h-3.5" />
                Ligar
              </span>
            )}
            <EmailPopover loja={loja} />
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          <Section title="Identificação" icon={Building2}>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 grid grid-cols-2 gap-3">
              <InfoCell label="CNPJ" value={loja.cnpj} />
              <InfoCell label="Grupo Financeiro" value={loja.grupo_financeiro} />
            </div>
          </Section>

          <Section title="Gestão e Operação" icon={Users}>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 grid grid-cols-2 gap-3">
              <InfoCell label="Regional" value={loja.regional} onClick={loja.regional ? () => goToContato(loja.regional) : undefined} />
              <InfoCell label="Diretor" value={loja.diretor} onClick={loja.diretor ? () => goToContato(loja.diretor) : undefined} />
              <InfoCell label="Unidade de Negócio" value={loja.unidade_negocio} span2 />
            </div>
          </Section>

          <Section title="Endereço" icon={MapPin}>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5">
              {hasAddress ? (
                <>
                  {addressLine.trim() && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{addressLine}</p>
                  )}
                  {bairroCityLine && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bairroCityLine}</p>
                  )}
                  <CepBadge cep={loja.cep} />
                </>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Endereço não informado</p>
              )}
            </div>
          </Section>

          <Section title="Horário de Funcionamento" icon={Clock}>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5">
              {abertura && fechamento ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400">Segunda a Sábado: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{abertura}</span>
                    <span className="text-slate-400 dark:text-slate-500"> às </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{fechamento}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Horário não informado</p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
