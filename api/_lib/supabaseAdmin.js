// Client Supabase « service role » — SERVEUR UNIQUEMENT.
// La clé service_role contourne la RLS : elle ne doit JAMAIS être exposée au
// navigateur (pas de préfixe VITE_). Définie dans Vercel → Environment Variables.
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabaseAdmin = Boolean(url && serviceKey)

export const supabaseAdmin = hasSupabaseAdmin
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null
