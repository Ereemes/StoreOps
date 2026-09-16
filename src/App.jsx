import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import LojasPage from './pages/LojasPage'
import MonitoramentoPage from './pages/MonitoramentoPage'
import ContatosPage from './pages/ContatosPage'
import UsuariosPage from './pages/UsuariosPage'

const ADMIN_EMAILS = ['admin.ti@grupooscar.com.br']

const AGENT_PROFILES = {
  'admin.ti@grupooscar.com.br': { nome: 'Admin TI', cargo: 'Coordenador', iniciais: 'AT' },
  'consulta.ti@grupooscar.com.br': { nome: 'Consulta TI', cargo: 'Operador N1', iniciais: 'CT' },
  'monitor@grupooscar.com.br': { nome: 'Monitor TV', cargo: 'Monitor', iniciais: 'MT', role: 'monitor' },
}

function buildUserProfile(supaUser) {
  const email = supaUser.email || ''
  const known = AGENT_PROFILES[email.toLowerCase()]
  if (known) return { ...known, email }
  const meta = supaUser.user_metadata || {}
  const role = meta.role || 'user'
  const nome = meta.nome || meta.full_name || email.split('@')[0]
  const iniciais = nome.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  return { nome, email, cargo: meta.cargo || 'Operador', iniciais, role }
}

function isAdmin(user) {
  return ADMIN_EMAILS.includes(user?.email?.toLowerCase())
}

function AppLayout({ user, dark, toggleTheme }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Header user={user} onLogout={() => supabase.auth.signOut()} dark={dark} onToggleTheme={toggleTheme} />
      <div className="flex flex-1 min-h-0">
        <Sidebar isAdmin={isAdmin(user)} />
        <main className="flex-1 px-6 lg:px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

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

  const [dark, toggleTheme] = useTheme()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  if (user.role === 'monitor') {
    return (
      <BrowserRouter>
        <MonitoramentoPage fullscreen onLogout={() => supabase.auth.signOut()} />
      </BrowserRouter>
    )
  }

  const admin = isAdmin(user)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout user={user} dark={dark} toggleTheme={toggleTheme} />}>
          <Route path="/" element={<Navigate to="/lojas" replace />} />
          <Route path="/lojas" element={<LojasPage />} />
          <Route path="/contatos" element={<ContatosPage />} />
          {admin && <Route path="/usuarios" element={<UsuariosPage />} />}
          <Route path="*" element={<Navigate to="/lojas" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
