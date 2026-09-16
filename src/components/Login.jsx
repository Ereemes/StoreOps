import { useState } from 'react'
import { Eye, EyeOff, LogIn, ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    setLoading(false)

    if (authError) {
      const knownErrors = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
        'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'User not found': 'E-mail ou senha incorretos.',
      }
      setError(knownErrors[authError.message] || 'Erro ao autenticar. Tente novamente.')
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Informe seu e-mail.')
      return
    }
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setLoading(false)

    if (resetError) {
      setError('Erro ao enviar e-mail. Tente novamente.')
    } else {
      setResetSent(true)
    }
  }

  if (resetMode) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="h-1.5 bg-red-600" />
            <div className="px-8 pt-8 pb-10">
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Redefinir Senha</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enviaremos um link para seu e-mail</p>
              </div>

              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto">
                    <Mail className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">E-mail enviado!</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Verifique sua caixa de entrada em <strong className="text-slate-700 dark:text-slate-200">{email}</strong> e clique no link para redefinir sua senha.
                    </p>
                  </div>
                  <button
                    onClick={() => { setResetMode(false); setResetSent(false); setError('') }}
                    className="inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors mt-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@grupooscar.com.br"
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Enviar Link
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setError('') }}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors pt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar ao login
                  </button>
                </form>
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1.5 bg-red-600" />

          <div className="px-8 pt-8 pb-10">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bem-vindo ao <span className="text-red-600 dark:text-red-500">StoreOps</span></h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Grupo Oscar · Painel de Gestão</p>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@grupooscar.com.br"
                  autoComplete="off"
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
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
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={e => setLembrar(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-red-600 focus:ring-red-500/20"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError('') }}
                  className="text-xs text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          © 2026 StoreOps · Grupo Oscar Calçados
        </p>
      </div>
    </div>
  )
}
