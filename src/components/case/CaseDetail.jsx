import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Gavel, Hash, Calendar, User2 } from 'lucide-react'
import { useCase } from '../../hooks/useCases.js'
import { formatDate } from '../../lib/utils.js'
import StatusBadge from '../shared/StatusBadge.jsx'
import PriorityBadge from '../shared/PriorityBadge.jsx'
import DeadlineIndicator from '../dashboard/DeadlineIndicator.jsx'
import ChecklistPanel from './ChecklistPanel.jsx'
import MagicLinkPanel from './MagicLinkPanel.jsx'
import CaseTimeline from './CaseTimeline.jsx'
import TriageSummary from './TriageSummary.jsx'
import EmptyState from '../shared/EmptyState.jsx'

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className="h-3.5 w-3.5 text-navy-400 mt-0.5" />
      <div className="flex-1">
        <div className="text-label uppercase tracking-wider text-navy-500">{label}</div>
        <div className={mono ? 'font-mono text-table text-navy-800' : 'text-table text-navy-800'}>
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { case: caseRow, checklist, magicLink, triage, uploads } = useCase(id)

  const events = useMemo(() => {
    if (!caseRow) return []
    const list = [
      {
        type: 'case_created',
        title: 'Case created',
        detail: `${caseRow.notice_section || ''} for AY ${caseRow.assessment_year}`,
        at: caseRow.created_at,
      },
    ]
    if (magicLink) {
      list.push({
        type: 'link_shared',
        title: 'Magic link generated',
        detail: 'Client can now upload documents securely.',
        at: magicLink.created_at,
      })
    }
    uploads.forEach((u) => {
      list.push({
        type: 'doc_uploaded',
        title: `Client uploaded ${u.file_name}`,
        at: u.uploaded_at,
      })
    })
    if (triage) {
      list.push({
        type: 'triage_complete',
        title: 'AI triage briefing generated',
        detail: `Risk: ${triage.risk_assessment}`,
        at: triage.created_at,
      })
    }
    return list.sort((a, b) => new Date(b.at) - new Date(a.at))
  }, [caseRow, magicLink, uploads, triage])

  if (!caseRow) {
    return (
      <div className="px-6 py-10">
        <EmptyState
          title="Case not found"
          description="It may have been removed, or the link is incorrect."
          action={
            <button onClick={() => navigate('/cases')} className="btn-primary">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/cases" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" /> All cases
        </Link>
        <span className="font-mono text-sm text-navy-500">{caseRow.case_number}</span>
        <StatusBadge status={caseRow.status} />
        <PriorityBadge priority={caseRow.priority} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            {caseRow.client_name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-navy-600">
            <span className="font-mono text-navy-700">{caseRow.client_pan || '—'}</span>
            <span>·</span>
            <span>{caseRow.notice_section || '—'} {caseRow.notice_type && `(${caseRow.notice_type})`}</span>
            <span>·</span>
            <span className="font-mono">AY {caseRow.assessment_year}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DeadlineIndicator date={caseRow.deadline} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-base font-medium text-navy-900 mb-3">
              Case information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow icon={Hash} label="Case number" value={caseRow.case_number} mono />
              <InfoRow icon={Calendar} label="Compliance deadline" value={formatDate(caseRow.deadline)} mono />
              <InfoRow icon={Gavel} label="Notice section" value={caseRow.notice_section} mono />
              <InfoRow icon={User2} label="Assessing Officer" value={caseRow.ao_name} />
              <InfoRow icon={MapPin} label="Ward / Circle" value={[caseRow.ward_circle, caseRow.jurisdiction].filter(Boolean).join(' · ')} />
              <InfoRow icon={Calendar} label="Assessment Year" value={caseRow.assessment_year} mono />
              <InfoRow icon={Mail} label="Client email" value={caseRow.client_email} />
              <InfoRow icon={Phone} label="Client phone" value={caseRow.client_phone} mono />
            </div>
            {caseRow.notes && (
              <div className="mt-4 rounded-md border border-navy-100 bg-cream-50 px-3 py-2 text-sm text-navy-700">
                {caseRow.notes}
              </div>
            )}
          </div>

          <TriageSummary caseRow={caseRow} triage={triage} checklist={checklist} />

          <CaseTimeline events={events} />
        </div>

        <div className="space-y-5">
          <ChecklistPanel items={checklist} />
          <MagicLinkPanel
            caseId={caseRow.id}
            magicLink={magicLink}
            clientName={caseRow.client_name}
            clientPhone={caseRow.client_phone}
          />
        </div>
      </div>
    </div>
  )
}
