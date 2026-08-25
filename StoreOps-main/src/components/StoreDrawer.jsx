import { useState } from 'react'
import { X, Phone, MessageCircle, Mail, MapPin, Clock, Building2, Users, Copy, Check } from 'lucide-react'
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
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoCell({ label, value, span2 }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-semibold">{value || '—'}</p>
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
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
      <span className="text-xs font-mono font-medium text-slate-700">CEP: {cep}</span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-all"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600">Copiado!</span>
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

export default function StoreDrawer({ loja, onClose }) {
  if (!loja) return null

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
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right border-l border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-500 font-mono">
                  {String(loja.codigo).padStart(3, '0')}
                </span>
                <StatusBadge loja={loja} />
                {isBeta(loja.codigo) && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">BETA</span>
                )}
                {hasTaxa(loja.codigo) && (
                  <span className="bg-purple-50 text-purple-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-purple-200">
                    {getFornecedor(loja.codigo)}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1.5 truncate">{loja.nome_fantasia}</h2>
              <p className="text-xs text-slate-400 truncate">{loja.razao_social}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors ml-3 shrink-0">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {whatsapp ? (
              <a
                href={`https://wa.me/55${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            ) : (
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold cursor-not-allowed">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </span>
            )}
            {phone ? (
              <a
                href={`tel:+55${phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Ligar
              </a>
            ) : (
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold cursor-not-allowed">
                <Phone className="w-3.5 h-3.5" />
                Ligar
              </span>
            )}
            <a
              href="mailto:"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              E-mail
            </a>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          <Section title="Identificação" icon={Building2}>
            <div className="bg-slate-50/80 rounded-xl p-3.5 grid grid-cols-2 gap-3">
              <InfoCell label="CNPJ" value={loja.cnpj} />
              <InfoCell label="Grupo Financeiro" value={loja.grupo_financeiro} />
            </div>
          </Section>

          <Section title="Gestão e Operação" icon={Users}>
            <div className="bg-slate-50/80 rounded-xl p-3.5 grid grid-cols-2 gap-3">
              <InfoCell label="Regional" value={loja.regional} />
              <InfoCell label="Diretor" value={loja.diretor} />
              <InfoCell label="Unidade de Negócio" value={loja.unidade_negocio} span2 />
            </div>
          </Section>

          <Section title="Endereço" icon={MapPin}>
            <div className="bg-slate-50/80 rounded-xl p-3.5">
              {hasAddress ? (
                <>
                  {addressLine.trim() && (
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">{addressLine}</p>
                  )}
                  {bairroCityLine && (
                    <p className="text-xs text-slate-500 mt-0.5">{bairroCityLine}</p>
                  )}
                  <CepBadge cep={loja.cep} />
                </>
              ) : (
                <p className="text-sm text-slate-400 italic">Endereço não informado</p>
              )}
            </div>
          </Section>

          <Section title="Horário de Funcionamento" icon={Clock}>
            <div className="bg-slate-50/80 rounded-xl p-3.5">
              {abertura && fechamento ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Segunda a Sábado: </span>
                    <span className="font-bold text-slate-800 font-mono">{abertura}</span>
                    <span className="text-slate-400"> às </span>
                    <span className="font-bold text-slate-800 font-mono">{fechamento}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Horário não informado</p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
