import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/auth.jsx'

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function Login() {
  const { isAuthenticated, signInWithGoogle, continueAsDemo, isSupabaseConfigured } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (isAuthenticated) {
    const to = location.state?.from?.pathname || '/cases'
    return <Navigate to={to} replace />
  }

  const handleGoogle = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error } = (await signInWithGoogle()) || {}
      if (error) setError(error.message)
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen w-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-navy-950 text-cream-100 p-12">
        <div className="font-display text-2xl font-semibold text-cream-50">
          Aaykar<span className="text-cream-300">Desk</span>
        </div>
        <div>
          <h1 className="font-display text-4xl leading-tight text-cream-50">
            From notice to response —<br />without switching tabs.
          </h1>
          <p className="mt-4 max-w-md text-navy-200">
            The orchestration layer for Indian Chartered Accountants handling income tax
            scrutiny notices. Upload, extract, collect, and respond — in one workflow.
          </p>
        </div>
        <div className="text-label uppercase tracking-wider text-navy-500">
          Scrutiny Workflow · v0.1
        </div>
      </div>

      {/* Auth panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-cream-50 px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 font-display text-2xl font-semibold text-navy-900">
            Aaykar<span className="text-navy-500">Desk</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-navy-100 px-3 py-1 text-label uppercase tracking-wider text-navy-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure sign-in
          </div>

          <h2 className="mt-4 font-display text-2xl font-semibold text-navy-900">
            Sign in to your firm
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            Use your Google Workspace account to continue.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-urgency-high/30 bg-urgency-high/5 px-3 py-2 text-sm text-urgency-high">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="btn-secondary mt-6 w-full justify-center py-2.5"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            Continue with Google
          </button>

          {!isSupabaseConfigured && (
            <>
              <div className="my-6 flex items-center gap-3 text-label uppercase tracking-wider text-navy-400">
                <span className="h-px flex-1 bg-navy-100" />
                or
                <span className="h-px flex-1 bg-navy-100" />
              </div>
              <button
                onClick={continueAsDemo}
                className="btn-ghost w-full justify-center"
              >
                Continue in demo mode
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-label text-navy-400">
                Google sign-in requires Supabase to be configured. Demo mode runs
                entirely in your browser.
              </p>
            </>
          )}

          <p className="mt-8 text-center text-label text-navy-400">
            By continuing you agree to AaykarDesk's terms of use.
          </p>
        </div>
      </div>
    </div>
  )
}
