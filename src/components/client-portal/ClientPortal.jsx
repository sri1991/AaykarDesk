import { useParams } from 'react-router-dom'
import { ShieldCheck, FileWarning, CheckCircle2 } from 'lucide-react'
import { useCaseByToken } from '../../hooks/useCases.js'
import DocumentChecklist from './DocumentChecklist.jsx'
import { formatDate } from '../../lib/utils.js'

export default function ClientPortal() {
  const { token } = useParams()
  const data = useCaseByToken(token)

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

  const { case: caseRow, checklist } = data
  const total = checklist.length
  const submitted = checklist.filter((i) => i.status !== 'pending').length
  const allDone = total > 0 && submitted === total

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
          {caseRow.deadline && (
            <p className="text-sm text-navy-700 mt-1">
              Compliance deadline: <span className="font-medium">{formatDate(caseRow.deadline)}</span>
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            <ShieldCheck className="h-4 w-4" />
            Files are stored securely and only your CA can access them.
          </div>
        </div>

        <div className="bg-white rounded-lg border border-navy-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-medium text-navy-900">
              Documents to submit
            </h2>
            <span className="text-xs font-mono text-navy-600">{submitted}/{total}</span>
          </div>
          <div className="h-1.5 w-full rounded bg-navy-100 overflow-hidden mb-4">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: total ? `${(submitted / total) * 100}%` : '0%' }}
            />
          </div>

          {allDone ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5" />
              <div>
                <div className="font-medium text-emerald-900">All documents submitted</div>
                <div className="text-sm text-emerald-800">
                  Thank you. Your CA has been notified and will review your uploads shortly.
                </div>
              </div>
            </div>
          ) : (
            <DocumentChecklist items={checklist} caseId={caseRow.id} />
          )}
        </div>

        <p className="text-center text-xs text-navy-500 pb-6">
          Need help? Reply on WhatsApp to your CA. Powered by AaykarDesk.
        </p>
      </main>
    </div>
  )
}
