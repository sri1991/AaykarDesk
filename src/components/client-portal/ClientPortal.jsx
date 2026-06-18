import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ShieldCheck,
  FileWarning,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { useCaseByToken } from '../../hooks/useCases.js'
import DocumentChecklist from './DocumentChecklist.jsx'
import { formatDate, deadlineUrgency, cx } from '../../lib/utils.js'

// Visual treatment + icon per deadline urgency state (Enhancement 4).
const DEADLINE_STYLE = {
  normal: { cls: 'text-navy-700', icon: null, bold: false },
  approaching: { cls: 'text-amber-700', icon: null, bold: false },
  urgent: { cls: 'text-orange-700', icon: Clock, bold: true },
  critical: { cls: 'text-red-700', icon: AlertTriangle, bold: true },
  today: { cls: 'text-red-700', icon: AlertTriangle, bold: true },
  overdue: { cls: 'text-red-700', icon: AlertTriangle, bold: true },
}

function DeadlineLine({ deadline, urgency }) {
  const style = DEADLINE_STYLE[urgency.state] || DEADLINE_STYLE.normal
  const Icon = style.icon
  const daysAbs = Math.abs(urgency.days ?? 0)
  const dayWord = daysAbs === 1 ? 'day' : 'days'

  let body
  if (urgency.state === 'today') {
    body = <span className={cx(style.cls, 'font-bold')}>Due today</span>
  } else if (urgency.state === 'overdue') {
    body = (
      <span className={cx(style.cls, 'font-bold')}>
        Overdue by {daysAbs} {dayWord}
      </span>
    )
  } else {
    const remaining = urgency.state !== 'normal' && urgency.days != null && (
      <span className={cx(style.cls, style.bold && 'font-bold', 'ml-1')}>
        · {urgency.days} {dayWord} remaining
      </span>
    )
    body = (
      <>
        <span className="font-medium text-navy-800">{formatDate(deadline)}</span>
        {remaining}
      </>
    )
  }

  return (
    <p className="text-sm text-navy-700 mt-1 flex items-center gap-1 flex-wrap">
      Compliance deadline:{' '}
      {Icon && <Icon className={cx('h-4 w-4', style.cls)} />}
      {body}
    </p>
  )
}

function StickyDeadlineBanner({ urgency }) {
  if (!['critical', 'today', 'overdue'].includes(urgency.state)) return null
  const daysAbs = Math.abs(urgency.days ?? 0)
  const dayWord = daysAbs === 1 ? 'day' : 'days'

  const copy =
    urgency.state === 'overdue'
      ? 'Submission deadline has passed. Please contact your CA to discuss next steps.'
      : urgency.state === 'today'
      ? 'Documents are due today. Please complete uploads.'
      : `Only ${urgency.days} ${dayWord} left to submit documents. Please complete uploads as soon as possible.`

  return (
    <div className="sticky top-0 z-20 bg-red-600 text-white shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{copy}</span>
      </div>
    </div>
  )
}

function NoticeSummary({ summary }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/60 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display text-sm font-semibold text-navy-900">
          <Info className="h-4 w-4 text-blue-700" />
          About this notice
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-navy-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-navy-500" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1 text-sm text-navy-700 leading-relaxed">{summary}</div>
      )}
    </div>
  )
}

export default function ClientPortal() {
  const { token } = useParams()
  const { data, loading } = useCaseByToken(token)

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="text-sm text-navy-600">Loading…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-navy-100 p-6 text-center">
          <FileWarning className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <h1 className="font-display text-lg font-semibold text-navy-900">
            Link not found or expired
          </h1>
          <p className="text-sm text-navy-600 mt-1">
            Please contact your Chartered Accountant for a new link.
          </p>
        </div>
      </div>
    )
  }

  const { case: caseRow, checklist, uploads = [] } = data
  const urgency = deadlineUrgency(caseRow.deadline)

  // Progress counts mandatory items by default, with optional shown separately.
  const isDone = (i) => i.status !== 'pending'
  const mandatory = checklist.filter((i) => i.is_mandatory !== false)
  const optional = checklist.filter((i) => i.is_mandatory === false)
  const mandatoryDone = mandatory.filter(isDone).length
  const optionalDone = optional.filter(isDone).length
  const allMandatoryDone = mandatory.length > 0 && mandatoryDone === mandatory.length

  const showSummary = caseRow.show_notice_summary !== false && caseRow.client_notice_summary

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-navy-950 text-cream-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="font-display text-base font-semibold text-cream-50">
            Aaykar<span className="text-cream-300">Desk</span>
          </div>
          <div className="text-label uppercase tracking-wider text-navy-400">
            Secure document portal
          </div>
        </div>
      </header>

      <StickyDeadlineBanner urgency={urgency} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-lg border border-navy-100 p-5">
          <h1 className="font-display text-xl font-semibold text-navy-900">
            Hi {caseRow.client_name?.split(' ')[0] || 'there'},
          </h1>
          <p className="text-sm text-navy-700 mt-1">
            Your CA has requested the following documents in connection with the income tax notice u/s{' '}
            <span className="font-mono">{caseRow.notice_section || '—'}</span> for AY{' '}
            <span className="font-mono">{caseRow.assessment_year}</span>.
          </p>
          {caseRow.deadline && <DeadlineLine deadline={caseRow.deadline} urgency={urgency} />}

          {showSummary && <NoticeSummary summary={caseRow.client_notice_summary} />}

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            <ShieldCheck className="h-4 w-4" />
            Files are stored securely and only your CA can access them.
          </div>
        </div>

        <div className="bg-white rounded-lg border border-navy-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-base font-medium text-navy-900">
              Documents to submit
            </h2>
            <span className="text-xs font-mono text-navy-600">
              {mandatoryDone}/{mandatory.length}
            </span>
          </div>
          <div className="mb-3 text-[11px] text-navy-500">
            {mandatoryDone}/{mandatory.length} required
            {optional.length > 0 && `, ${optionalDone}/${optional.length} optional`}
          </div>
          <div className="h-1.5 w-full rounded bg-navy-100 overflow-hidden mb-4">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                width: mandatory.length
                  ? `${(mandatoryDone / mandatory.length) * 100}%`
                  : '0%',
              }}
            />
          </div>

          {allMandatoryDone && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5" />
              <div>
                <div className="font-medium text-emerald-900">All required documents submitted</div>
                <div className="text-sm text-emerald-800">
                  Thank you. Your CA has been notified and will review your uploads shortly.
                </div>
              </div>
            </div>
          )}

          <DocumentChecklist items={checklist} caseId={caseRow.id} token={token} uploads={uploads} />
        </div>

        <p className="text-center text-xs text-navy-500 pb-6">
          Need help? Reply on WhatsApp to your CA. Powered by AaykarDesk.
        </p>
      </main>
    </div>
  )
}
