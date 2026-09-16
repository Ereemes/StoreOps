import { useState, useMemo } from 'react'
import { Eye, EyeOff, KeyRound, CheckCircle, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

function PasswordStrength({ password }) {
  const checks = useMemo(() => [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /[0-9]/.test(password) },
    { label: 'Caractere especial', ok: /[^A-Za-z0-9]/.test(password) },
  ], [password])

  const score = checks.filter(c => c.ok).length

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i <= score
              ? score <= 2 ? 'bg-red-400' : score <= 3 ? 'bg-amber-400' : 'bg-green-400'
              : 'bg-slate-200 dark:bg-slate-700'
          }`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5">
            {ok
              ? <Check className="w-3 h-3 text-green-500" />
              : <X className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            }
            <span className={`text-[10px] ${ok ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function validatePassword(password) {
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
  if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.'
  if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.'
  if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.'
  return null
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const validationError = validatePassword(password)
    if (validationError) {
      setError(validationError)
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      setError(updateError.message === 'New password should be different from the old password.'
        ? 'A nova senha deve ser diferente da anterior.'
        : 'Erro ao redefinir senha. O link pode ter expirado.')
    } else {
      setDone(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1.5 bg-red-600" />

          <div className="px-8 pt-8 pb-10">
            {done ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Senha definida!</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sua senha foi configurada com sucesso. Você já pode acessar o sistema.
                  </p>
                </div>
                <button
                  onClick={() => { window.location.href = '/' }}
                  className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Ir para o StoreOps
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-7 h-7 text-red-500" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Definir Senha</h1>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Crie uma senha segura para acessar o StoreOps</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full h-10 px-3.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Confirmar Senha</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Definir Senha
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          © 2026 StoreOps · Grupo Oscar Calçados
        </p>
      </div>
    </div>
  )
}
