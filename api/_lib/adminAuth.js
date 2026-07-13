import { supabaseAdmin } from './supabaseAdmin.js'

export function readBearerToken(authorization) {
  if (Array.isArray(authorization)) return ''
  const match = /^Bearer ([^\s]+)$/.exec(String(authorization || ''))
  return match?.[1] || ''
}

export async function authenticateAdminRequest(req, client = supabaseAdmin) {
  if (!client) {
    return { ok: false, status: 503, error: 'Base de donnees non configuree.' }
  }

  const token = readBearerToken(req?.headers?.authorization)
  if (!token) {
    return { ok: false, status: 401, error: 'Authentification requise.' }
  }

  const { data: userData, error: userError } = await client.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) {
    return { ok: false, status: 401, error: 'Session admin invalide.' }
  }

  const { data: membership, error: membershipError } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (membershipError) {
    console.error('admin authorization lookup error:', membershipError)
    return { ok: false, status: 503, error: 'Autorisation admin indisponible.' }
  }

  if (!membership) {
    return { ok: false, status: 403, error: 'Acces administrateur refuse.' }
  }

  return { ok: true, user }
}
