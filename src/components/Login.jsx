import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (authError.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.')
      } else if (authError.message === 'Email not confirmed') {
        setError('E-mail ainda não confirmado. Verifique sua caixa de entrada.')
      } else {
        setError(authError.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          <div className="h-1.5 bg-red-600" />

          <div className="px-8 pt-8 pb-10">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bem-vindo ao <span className="text-red-600">StoreOps</span></h1>
              <p className="text-xs text-slate-400 mt-1">Grupo Oscar · Painel de Gestão</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@grupooscar.com.br"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                    className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500/20"
                  />
                  <span className="text-xs text-slate-500">Lembrar de mim</span>
                </label>
                <button type="button" className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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

        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2026 StoreOps · Grupo Oscar Calçados
        </p>
      </div>
    </div>
  )
}
