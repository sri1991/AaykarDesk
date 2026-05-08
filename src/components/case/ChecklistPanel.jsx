import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const STATUS_META = {
  pending: { icon: Circle, label: 'Pending', cls: 'text-navy-400' },
  uploaded: { icon: Clock, label: 'Uploaded', cls: 'text-blue-700' },
  verified: { icon: CheckCircle2, label: 'Verified', cls: 'text-emerald-700' },
  rejected: { icon: AlertTriangle, label: 'Rejected', cls: 'text-red-700' },
}

export default function ChecklistPanel({ items }) {
  const total = items.length
  const done = items.filter((i) => i.status === 'verified' || i.status === 'uploaded').length

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <h3 className="font-display text-base font-medium text-navy-900">
          Document checklist
        </h3>
        <span className="text-xs font-mono text-navy-600">
          {done}/{total}
        </span>
      </div>
      <div className="px-4 pt-3">
        <div className="h-1.5 w-full rounded bg-navy-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>
      <ul className="divide-y divide-navy-50 px-1 py-2">
        {items.map((item) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending
          const Icon = meta.icon
          return (
            <li key={item.id} className="flex items-start gap-3 px-3 py-2.5">
              <Icon className={cx('h-4 w-4 mt-0.5 shrink-0', meta.cls)} />
              <div className="flex-1">
                <div className="text-sm font-medium text-navy-900">
                  {item.document_name}
                  {!item.is_mandatory && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-navy-500">optional</span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-navy-500">{item.description}</div>
                )}
              </div>
              <span className={cx('text-xs font-medium', meta.cls)}>{meta.label}</span>
            </li>
          )
        })}
        {items.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-navy-500">
            No checklist items.
          </li>
        )}
      </ul>
    </div>
  )
}
