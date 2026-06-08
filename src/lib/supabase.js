import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Parse the OAuth token/code from the redirect URL on load so the
        // session is established when Google sends the user back to the app.
        detectSessionInUrl: true,
      },
    })
  : null

export const STORAGE_BUCKETS = {
  notices: 'notices',
  clientUploads: 'client-uploads',
}
