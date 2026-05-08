import { cx, STATUS_LABELS } from '../../lib/utils.js'

const COLORS = {
  new: 'bg-navy-50 text-navy-700 border-navy-200',
  extraction_pending: 'bg-amber-50 text-amber-800 border-amber-200',
  awaiting_documents: 'bg-amber-50 text-amber-800 border-amber-200',
  documents_received: 'bg-blue-50 text-blue-800 border-blue-200',
  triage_pending: 'bg-violet-50 text-violet-800 border-violet-200',
  triage_complete: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  draft_ready: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  response_filed: 'bg-navy-100 text-navy-800 border-navy-200',
  closed: 'bg-navy-100 text-navy-700 border-navy-200',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-label font-medium',
        COLORS[status] || 'bg-navy-50 text-navy-700 border-navy-200',
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}
