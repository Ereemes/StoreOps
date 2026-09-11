import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAILS = ['admin.ti@grupooscar.com.br']

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders() })
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
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  try {
    const callerEmail = await getCallerEmail(req)
    if (!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) {
      return json({ error: 'Acesso negado. Apenas administradores.' }, 403)
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

      return json({ users: mapped })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { email, password, nome, cargo } = body

      if (!email || !password) {
        return json({ error: 'E-mail e senha são obrigatórios.' }, 400)
      }

      if (password.length < 6) {
        return json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, 400)
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome: nome || '', cargo: cargo || 'Operador' },
      })

      if (error) {
        if (error.message.includes('already been registered')) {
          return json({ error: 'Este e-mail já está cadastrado.' }, 409)
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
      }, 201)
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const { id, nome, cargo, password } = body

      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400)

      const updates: Record<string, unknown> = {
        user_metadata: { nome, cargo },
      }

      if (password && password.length >= 6) {
        updates.password = password
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, updates)
      if (error) throw error

      return json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const body = await req.json()
      const { id } = body

      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400)

      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(id)
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return json({ error: 'Não é possível excluir o administrador.' }, 403)
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) throw error

      return json({ ok: true })
    }

    return json({ error: 'Método não suportado.' }, 405)
  } catch (err) {
    return json({ error: err.message || 'Erro interno.' }, 500)
  }
})
