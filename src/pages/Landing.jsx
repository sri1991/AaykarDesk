import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Upload,
  Sparkles,
  Link2,
  ShieldCheck,
  FileSearch,
  Scale,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

const FEATURES = [
  {
    icon: Upload,
    title: 'Upload the notice',
    body: 'Drop the 143(2)/142(1) PDF. No re-keying — the case starts from the document itself.',
  },
  {
    icon: Sparkles,
    title: 'AI extracts every field',
    body: 'Section, assessment year, deadline, AO and the full annexure of requested documents — in seconds.',
  },
  {
    icon: Link2,
    title: 'One link to the client',
    body: 'Share a magic link. The client uploads each document against a clear checklist, you get notified when they are done.',
  },
  {
    icon: FileSearch,
    title: 'Law, laid out',
    body: 'Section references mapped 1961 ↔ 2025 and the relevant Income Tax Rules — the legal groundwork for the issues raised, ready in the case file.',
  },
  {
    icon: Scale,
    title: 'Reconciliation side-by-side',
    body: '"As per Notice / 26AS" against "As per Client Records", with mismatches highlighted for you.',
  },
  {
    icon: ShieldCheck,
    title: 'Firm-scoped and secure',
    body: 'Every case, checklist and upload is scoped to your firm with row-level security. Clients only ever see their own case.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Upload',
    body: 'Notice PDF in. AI extracts the section, AY, deadline and document list — and detects Faceless vs jurisdictional.',
  },
  {
    n: '02',
    title: 'Collect',
    body: 'Send one magic link. The client works through the checklist; uploads land straight in the case file.',
  },
  {
    n: '03',
    title: 'Respond',
    body: 'Reconcile, research and draft — then jump to the IT Portal e-Proceedings with everything in hand.',
  },
]

function Logo({ className = '' }) {
  return (
    <span className={`font-display text-xl font-semibold ${className}`}>
      Aaykar<span className="text-navy-500">Desk</span>
    </span>
  )
}

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const primaryTo = isAuthenticated ? '/cases' : '/login'
  const primaryLabel = isAuthenticated ? 'Go to dashboard' : 'Sign in'

  return (
    <div className="min-h-screen w-full bg-cream-50 text-navy-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-navy-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="text-navy-900" />
          <nav className="flex items-center gap-2">
            <a
              href="#how-it-works"
              className="hidden btn-ghost sm:inline-flex"
            >
              How it works
            </a>
            <a href="#features" className="hidden btn-ghost sm:inline-flex">
              Features
            </a>
            <Link to={primaryTo} className="btn-primary">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-100 px-3 py-1 text-label uppercase tracking-wider text-navy-700">
            <Sparkles className="h-3.5 w-3.5" />
            For Indian Chartered Accountants
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-navy-950 sm:text-5xl lg:text-6xl">
            From notice to response —{' '}
            <span className="text-navy-500">without switching tabs.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            AaykarDesk is the orchestration layer for income tax scrutiny notices.
            Upload a notice, let AI extract the key fields, collect documents from your
            client with a single link, and respond — all in one case workflow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={primaryTo} className="btn-primary px-5 py-2.5 text-base">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary px-5 py-2.5 text-base">
              See how it works
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-urgency-low" />
              Notice to case in under 60 seconds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-urgency-low" />
              Works alongside Jamku, Tally &amp; the IT portal
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-navy-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            Everything between the notice and the response
          </h2>
          <p className="mt-3 max-w-2xl text-navy-600">
            The 4–6 hours of admin your clerk spends switching between five tools —
            handled in one place.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-navy-100 text-navy-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-navy-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-navy-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            Three steps, one workflow
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ n, title, body }) => (
              <div key={n}>
                <div className="font-mono text-sm font-semibold text-navy-400">
                  {n}
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 text-navy-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl bg-navy-950 px-8 py-14 text-center text-cream-100 sm:px-16">
            <h2 className="font-display text-3xl font-semibold text-cream-50">
              Ready to handle your next scrutiny notice?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-navy-200">
              Sign in to your firm and create your first case. Everything your clerk
              does today still happens — AaykarDesk just removes the admin between it.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to={primaryTo}
                className="inline-flex items-center gap-2 rounded-md bg-cream-50 px-6 py-3 text-base font-medium text-navy-900 shadow-sm transition hover:bg-cream-200"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <Logo className="text-navy-900" />
          <p className="text-label uppercase tracking-wider text-navy-400">
            Scrutiny Workflow · v0.1
          </p>
          <Link to={primaryTo} className="btn-ghost">
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
