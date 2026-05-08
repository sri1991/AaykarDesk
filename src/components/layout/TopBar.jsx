import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'

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

export default function TopBar() {
  const { pathname } = useLocation()
  const crumbs = crumbsFromPath(pathname)
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
        <div className="h-8 w-8 rounded-full bg-navy-200 text-navy-800 grid place-items-center text-xs font-semibold">
          CA
        </div>
      </div>
    </header>
  )
}
