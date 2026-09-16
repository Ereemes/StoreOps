import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAILS = ['admin.ti@grupooscar.com.br']

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const ALLOWED_ORIGINS = [
  'https://storeops-alpha.vercel.app',
  'http://localhost:5173',
]

function corsHeaders(req?: Request) {
  const origin = req?.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  }
}

function json(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(req) })
}

async function getCallerEmail(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.email?.toLowerCase() || null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }

  try {
    const callerEmail = await getCallerEmail(req)
    if (!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) {
      return json({ error: 'Acesso negado. Apenas administradores.' }, 403, req)
    }

    if (req.method === 'GET') {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 })
      if (error) throw error

      const mapped = users.map(u => ({
        id: u.id,
        email: u.email,
        nome: u.user_metadata?.nome || '',
        cargo: u.user_metadata?.cargo || '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }))

      return json({ users: mapped }, 200, req)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { email, nome, cargo } = body

      if (!email) {
        return json({ error: 'E-mail é obrigatório.' }, 400, req)
      }

      const safeNome = (nome || '').replace(/[<>"'&]/g, '').substring(0, 100)
      const safeCargo = (cargo || 'Operador').replace(/[<>"'&]/g, '').substring(0, 50)

      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { nome: safeNome, cargo: safeCargo },
      })

      if (error) {
        if (error.message.includes('already been registered')) {
          return json({ error: 'Este e-mail já está cadastrado.' }, 409, req)
        }
        throw error
      }

      return json({
        user: {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.user_metadata?.nome || '',
          cargo: data.user.user_metadata?.cargo || '',
        },
        invited: true,
      }, 201, req)
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const { id, nome, cargo, password } = body

      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400, req)

      const safeNome = (nome || '').replace(/[<>"'&]/g, '').substring(0, 100)
      const safeCargo = (cargo || '').replace(/[<>"'&]/g, '').substring(0, 50)

      const updates: Record<string, unknown> = {
        user_metadata: { nome: safeNome, cargo: safeCargo },
      }

      if (password && password.length >= 8) {
        updates.password = password
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, updates)
      if (error) throw error

      return json({ ok: true }, 200, req)
    }

    if (req.method === 'DELETE') {
      const body = await req.json()
      const { id } = body

      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400, req)

      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(id)
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return json({ error: 'Não é possível excluir o administrador.' }, 403, req)
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) throw error

      return json({ ok: true }, 200, req)
    }

    return json({ error: 'Método não suportado.' }, 405, req)
  } catch (err) {
    return json({ error: 'Erro interno.' }, 500, req)
  }
})
