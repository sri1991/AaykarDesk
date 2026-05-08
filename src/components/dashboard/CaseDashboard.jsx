import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, Search, AlarmClock, Inbox, Sparkles, FileCheck2 } from 'lucide-react'
import CaseRow from './CaseRow.jsx'
import EmptyState from '../shared/EmptyState.jsx'
import { useCases } from '../../hooks/useCases.js'
import { daysUntil, STATUS_LABELS, PRIORITY_LABELS } from '../../lib/utils.js'

function StatCard({ icon: Icon, label, value, hint, tone = 'default' }) {
  const toneCls =
    tone === 'urgent'
      ? 'border-red-200 bg-red-50'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'good'
      ? 'border-emerald-200 bg-emerald-50'
      : 'border-navy-100 bg-white'
  return (
    <div className={`card p-4 ${toneCls}`}>
      <div className="flex items-center justify-between">
        <span className="text-label uppercase tracking-wider text-navy-600">
          {label}
        </span>
        <Icon className="h-4 w-4 text-navy-500" />
      </div>
      <div className="mt-2 font-display text-stat font-semibold text-navy-900">
        {value}
      </div>
      {hint && <div className="text-xs text-navy-500 mt-0.5">{hint}</div>}
    </div>
  )
}

export default function CaseDashboard() {
  const cases = useCases()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [query, setQuery] = useState('')

  const stats = useMemo(() => {
    const active = cases.filter((c) => !['closed', 'response_filed'].includes(c.status))
    const dueWeek = cases.filter((c) => {
      const d = daysUntil(c.deadline)
      return d !== null && d >= 0 && d <= 7
    })
    const awaiting = cases.filter((c) => c.status === 'awaiting_documents')
    const triageReady = cases.filter((c) =>
      ['documents_received', 'triage_pending'].includes(c.status),
    )
    return {
      active: active.length,
      dueWeek: dueWeek.length,
      awaiting: awaiting.length,
      triageReady: triageReady.length,
    }
  }, [cases])

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const hay = [
          c.case_number,
          c.client_name,
          c.client_pan,
          c.notice_section,
          c.assessment_year,
          c.ao_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [cases, statusFilter, priorityFilter, query])

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy-900">
            Case Dashboard
          </h1>
          <p className="text-sm text-navy-600 mt-0.5">
            Active scrutiny and reassessment matters across the firm.
          </p>
        </div>
        <Link to="/cases/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Case
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Inbox} label="Active cases" value={stats.active} />
        <StatCard
          icon={AlarmClock}
          label="Due this week"
          value={stats.dueWeek}
          tone={stats.dueWeek > 0 ? 'urgent' : 'default'}
          hint={stats.dueWeek > 0 ? 'Action required' : 'All clear'}
        />
        <StatCard
          icon={FileCheck2}
          label="Awaiting documents"
          value={stats.awaiting}
          tone={stats.awaiting > 0 ? 'warn' : 'default'}
        />
        <StatCard
          icon={Sparkles}
          label="Triage ready"
          value={stats.triageReady}
          tone={stats.triageReady > 0 ? 'good' : 'default'}
        />
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-navy-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case, PAN, client…"
              className="input pl-8 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-navy-500" />
            <select
              className="input w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              className="input w-36"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-navy-500">
            {filtered.length} of {cases.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No cases match your filters"
            description="Try clearing search or status filters, or create a new case."
            action={
              <Link to="/cases/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                New Case
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-100 bg-cream-100">
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Case #</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Client</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Section</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">AY</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Deadline</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Status</th>
                  <th className="px-4 py-2.5 text-label uppercase tracking-wider text-navy-600">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <CaseRow key={c.id} row={c} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
