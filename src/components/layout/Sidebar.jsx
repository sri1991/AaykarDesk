import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, Archive, Settings, FileText } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const NAV = [
  { to: '/cases', label: 'Cases', icon: LayoutDashboard, end: true },
  { to: '/cases/new', label: 'New Case', icon: FilePlus2 },
]

const SECONDARY = [
  { to: '#', label: 'Archive', icon: Archive, disabled: true },
  { to: '#', label: 'Templates', icon: FileText, disabled: true },
  { to: '#', label: 'Settings', icon: Settings, disabled: true },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-navy-100 bg-navy-950 text-cream-100">
      <div className="px-5 py-5 border-b border-navy-800">
        <div className="font-display text-xl font-semibold text-cream-50">
          Aaykar<span className="text-cream-300">Desk</span>
        </div>
        <div className="mt-1 text-label uppercase tracking-wider text-navy-400">
          Scrutiny Workflow
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-navy-800 text-cream-50'
                      : 'text-navy-200 hover:bg-navy-900 hover:text-cream-50',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="px-5 mt-6 mb-2 text-label uppercase tracking-wider text-navy-500">
          Coming soon
        </div>
        <ul className="px-2 space-y-1">
          {SECONDARY.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                disabled
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-navy-500 cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-5 py-4 border-t border-navy-800 text-label text-navy-400">
        v0.1 · Demo build
      </div>
    </aside>
  )
}
