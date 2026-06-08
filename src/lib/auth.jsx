import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { ensureProvisioned, resetProvisioning } from './api.js'

const DEMO_KEY = 'aaykardesk_demo_session'

const AuthContext = createContext(null)

// Demo session used when Supabase is not configured, so the app stays fully
// usable for demos and reviews without a backend or OAuth provider.
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@aaykardesk.in',
  user_metadata: { full_name: 'Demo CA', avatar_url: null },
  isDemo: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Restore a previously chosen demo session.
      const stored = localStorage.getItem(DEMO_KEY)
      setUser(stored ? DEMO_USER : null)
      setLoading(false)
      return
    }

    let active = true
    // Ensure a firm + user row exists for the signed-in account, then expose
    // the user. Provisioning failure should not block sign-in.
    const onSession = async (session) => {
      const u = session?.user ?? null
      if (u) {
        try {
          await ensureProvisioned()
        } catch {
          /* provisioning is best-effort; data reads will surface errors */
        }
      } else {
        resetProvisioning()
      }
      if (!active) return
      setUser(u)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => onSession(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      onSession(session)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(DEMO_KEY, '1')
      setUser(DEMO_USER)
      return { error: null }
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/cases`,
      },
    })
  }, [])

  const continueAsDemo = useCallback(() => {
    localStorage.setItem(DEMO_KEY, '1')
    setUser(DEMO_USER)
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isSupabaseConfigured,
    signInWithGoogle,
    continueAsDemo,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
