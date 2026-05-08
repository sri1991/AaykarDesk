import { cx, PRIORITY_LABELS } from '../../lib/utils.js'

const COLORS = {
  critical: 'bg-red-50 text-red-800 border-red-200',
  high: 'bg-amber-50 text-amber-800 border-amber-200',
  medium: 'bg-navy-50 text-navy-700 border-navy-200',
  low: 'bg-navy-50 text-navy-500 border-navy-100',
}

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-label font-medium',
        COLORS[priority] || COLORS.medium,
      )}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}
