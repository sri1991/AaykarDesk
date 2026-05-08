import { ShieldCheck } from 'lucide-react'
import { formatDate } from '../../lib/utils.js'
import StatusBadge from '../shared/StatusBadge.jsx'
import PriorityBadge from '../shared/PriorityBadge.jsx'
import DeadlineIndicator from '../dashboard/DeadlineIndicator.jsx'

export default function CaseCreateForm({ data, onCreate, isCreating }) {
  const docs = data.documents_requested || []
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="font-display text-base font-medium text-navy-900 mb-3">
          Confirm and create case
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="label">Client</dt>
            <dd className="font-medium text-navy-900">{data.client_name || '—'}</dd>
            <div className="font-mono text-xs text-navy-500">{data.client_pan || '—'}</div>
          </div>
          <div>
            <dt className="label">Notice</dt>
            <dd className="font-mono text-navy-800">
              {data.notice_section || '—'} · {data.notice_type || '—'}
            </dd>
            <div className="text-xs text-navy-500">AY {data.assessment_year || '—'}</div>
          </div>
          <div>
            <dt className="label">Assessing Officer</dt>
            <dd className="text-navy-800">{data.ao_name || '—'}</dd>
            <div className="text-xs text-navy-500">
              {[data.ward_circle, data.jurisdiction].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div>
            <dt className="label">Deadline</dt>
            <dd className="flex flex-col gap-1.5 items-start">
              <DeadlineIndicator date={data.deadline} />
              <span className="text-xs text-navy-500">{formatDate(data.deadline)}</span>
            </dd>
          </div>
          <div>
            <dt className="label">Status</dt>
            <dd><StatusBadge status="awaiting_documents" /></dd>
          </div>
          <div>
            <dt className="label">Priority</dt>
            <dd><PriorityBadge priority={data.priority || 'medium'} /></dd>
          </div>
        </dl>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-base font-medium text-navy-900 mb-2">
          Document checklist ({docs.length})
        </h3>
        <ul className="text-sm text-navy-800 space-y-1.5">
          {docs.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-navy-400 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="font-medium">{d.name || '(unnamed)'}</div>
                {d.description && <div className="text-xs text-navy-500">{d.description}</div>}
              </div>
            </li>
          ))}
          {docs.length === 0 && (
            <li className="text-navy-500">No documents specified.</li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-emerald-900">
          <ShieldCheck className="h-4 w-4" />
          A magic link will be generated and ready to share with the client on the next screen.
        </div>
        <button onClick={onCreate} disabled={isCreating} className="btn-primary">
          {isCreating ? 'Creating…' : 'Create Case'}
        </button>
      </div>
    </div>
  )
}
