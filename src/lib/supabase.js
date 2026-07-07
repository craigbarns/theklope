// La librairie @supabase/supabase-js (~54 Ko gzip) n'est utile qu'à la connexion
// admin et à la synchronisation du catalogue. On la charge donc À LA DEMANDE
// (import dynamique) pour ne pas l'embarquer dans le bundle initial du visiteur.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Simple booléen d'env : ne dépend pas de la librairie, donc n'entraîne aucun coût.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

let clientPromise = null

// Renvoie l'instance Supabase (créée une seule fois), ou null si non configuré.
export async function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabasePublishableKey),
    )
  }
  return clientPromise
}
