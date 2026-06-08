import { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Search, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/auth.jsx'

function crumbsFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'Cases', to: '/cases' }]
  if (parts[0] === 'cases' && parts.length === 1) return [{ label: 'Cases', to: '/cases' }]
  if (parts[0] === 'cases' && parts[1] === 'new')
    return [
      { label: 'Cases', to: '/cases' },
      { label: 'New Case', to: '/cases/new' },
    ]
  if (parts[0] === 'cases' && parts[1])
    return [
      { label: 'Cases', to: '/cases' },
      { label: 'Case Detail', to: `/cases/${parts[1]}` },
    ]
  return [{ label: 'Cases', to: '/cases' }]
}

function initials(name, email) {
  const base = (name || email || 'CA').trim()
  const parts = base.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export default function TopBar() {
  const { pathname } = useLocation()
  const crumbs = crumbsFromPath(pathname)
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const name = user?.user_metadata?.full_name
  const email = user?.email
  const avatar = user?.user_metadata?.avatar_url

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-navy-100 bg-white px-6 py-3">
      <nav className="flex items-center gap-1 text-sm text-navy-600">
        {crumbs.map((c, i) => (
          <span key={c.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-navy-300" />}
            <Link
              to={c.to}
              className={
                i === crumbs.length - 1
                  ? 'font-medium text-navy-900'
                  : 'hover:text-navy-900'
              }
            >
              {c.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
          <input
            placeholder="Search cases, PAN, client…"
            className="input pl-8 w-72"
          />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full transition hover:opacity-90"
            aria-label="Account menu"
          >
            {avatar ? (
              <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="h-8 w-8 rounded-full bg-navy-200 text-navy-800 grid place-items-center text-xs font-semibold">
                {initials(name, email)}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-navy-100 bg-white shadow-lg z-20">
              <div className="px-4 py-3 border-b border-navy-100">
                <div className="text-sm font-medium text-navy-900 truncate">
                  {name || 'Signed in'}
                </div>
                {email && (
                  <div className="text-label text-navy-500 truncate">{email}</div>
                )}
              </div>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-navy-700 hover:bg-cream-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
