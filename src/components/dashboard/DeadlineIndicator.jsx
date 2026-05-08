import { cx, deadlineSeverity, formatDate } from '../../lib/utils.js'
import { AlertTriangle } from 'lucide-react'

const STYLES = {
  none: 'bg-navy-50 text-navy-500 border-navy-100',
  low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-red-50 text-red-800 border-red-200 deadline-pulse',
  overdue: 'bg-red-100 text-red-900 border-red-400',
}

export default function DeadlineIndicator({ date, compact }) {
  const { level, days } = deadlineSeverity(date)
  const label =
    level === 'overdue'
      ? `${Math.abs(days)}d overdue`
      : level === 'none'
      ? 'No deadline'
      : days === 0
      ? 'Due today'
      : `${days}d left`

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-medium',
        STYLES[level],
      )}
      title={formatDate(date)}
    >
      {(level === 'high' || level === 'overdue') && (
        <AlertTriangle className="h-3 w-3" />
      )}
      {compact ? label : (
        <>
          {label}
          <span className="text-navy-400 font-normal">· {formatDate(date)}</span>
        </>
      )}
    </span>
  )
}
