import { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getSignedUrl } from '../../lib/api.js'
import { STORAGE_BUCKETS } from '../../lib/supabase.js'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Gavel,
  Hash,
  Calendar,
  User2,
  FileText,
  FolderCheck,
  ArrowLeftRight,
  Search,
  Send,
  Download,
} from 'lucide-react'
import { useCase } from '../../hooks/useCases.js'
import { formatDate } from '../../lib/utils.js'
import StatusBadge from '../shared/StatusBadge.jsx'
import PriorityBadge from '../shared/PriorityBadge.jsx'
import DeadlineIndicator from '../dashboard/DeadlineIndicator.jsx'
import RegimeBadge from './RegimeBadge.jsx'
import ChecklistPanel from './ChecklistPanel.jsx'
import MagicLinkPanel from './MagicLinkPanel.jsx'
import CaseTimeline from './CaseTimeline.jsx'
import ReconciliationTab from './ReconciliationTab.jsx'
import ResearchTab from './ResearchTab.jsx'
import ResponseTab from './ResponseTab.jsx'
import EmptyState from '../shared/EmptyState.jsx'
import LoadingSpinner from '../shared/LoadingSpinner.jsx'
import { cx } from '../../lib/utils.js'

const TABS = [
  { key: 'notice', label: 'Notice', icon: FileText },
  { key: 'documents', label: 'Documents', icon: FolderCheck },
  { key: 'reconciliation', label: 'Reconciliation', icon: ArrowLeftRight },
  { key: 'research', label: 'Research', icon: Search },
  { key: 'response', label: 'Response', icon: Send },
]

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

async function openStoredFile(bucket, path) {
  const url = await getSignedUrl(bucket, path)
  if (url) window.open(url, '_blank', 'noopener')
}

function NoticeTab({ caseRow, guidance, events, notice }) {
  const issues = guidance?.key_issues || []
  return (
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

        <div className="card p-5">
          <h3 className="font-display text-base font-medium text-navy-900 mb-2">
            Notice document
          </h3>
          {notice ? (
            <div className="flex items-center justify-between rounded-md border border-navy-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-navy-500 shrink-0" />
                <span className="text-sm text-navy-800 truncate">{notice.file_name}</span>
              </div>
              <button
                onClick={() => openStoredFile(STORAGE_BUCKETS.notices, notice.file_path)}
                className="btn-secondary px-3 py-1.5 text-xs shrink-0"
              >
                <Download className="h-3.5 w-3.5" /> View PDF
              </button>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-navy-200 bg-cream-50 px-4 py-10 text-center text-sm text-navy-600">
              <FileText className="mx-auto h-6 w-6 text-navy-400 mb-2" />
              No notice PDF stored for this case.
            </div>
          )}
          {issues.length > 0 && (
            <div className="mt-4">
              <h4 className="font-display text-sm font-medium text-navy-900 mb-2">Key issues raised</h4>
              <ul className="list-disc pl-5 text-sm text-navy-700 space-y-1">
                {issues.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          )}
        </div>

        <CaseTimeline events={events} />
      </div>

      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="font-display text-sm font-medium text-navy-900 mb-2">Compliance window</h3>
          <DeadlineIndicator date={caseRow.deadline} />
          <div className="mt-3 text-xs text-navy-600">
            Deadline type: <span className="font-medium text-navy-800">{caseRow.deadline_type || 'statutory'}</span>
          </div>
        </div>
        <div className="card p-5 space-y-2">
          <h3 className="font-display text-sm font-medium text-navy-900">Assessment regime</h3>
          <RegimeBadge regime={caseRow.assessment_regime} isFaceless={caseRow.is_faceless} />
          {caseRow.is_faceless ? (
            <p className="text-xs text-navy-600 mt-2 leading-relaxed">
              Issued via the National Faceless Assessment Centre. Reply must be filed via e-Proceedings on the
              IT portal — no physical hearing.
            </p>
          ) : (
            <p className="text-xs text-navy-600 mt-2 leading-relaxed">
              Issued by a jurisdictional Assessing Officer. Physical submission to the AO may be required in addition to portal filing.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function DocumentsTab({ caseRow, checklist, magicLink, uploads }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <ChecklistPanel items={checklist} uploads={uploads} />
      </div>
      <div className="space-y-5">
        <MagicLinkPanel
          caseId={caseRow.id}
          magicLink={magicLink}
          clientName={caseRow.client_name}
          clientPhone={caseRow.client_phone}
        />
      </div>
    </div>
  )
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    case: caseRow,
    checklist,
    magicLink,
    triage,
    uploads,
    referenceGuidance,
    clientFinancials,
    notice,
    loading,
  } = useCase(id)
  const [tab, setTab] = useState('notice')

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

  if (loading && !caseRow) {
    return (
      <div className="px-6 py-10 grid place-items-center">
        <LoadingSpinner label="Loading case…" />
      </div>
    )
  }

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
        <RegimeBadge regime={caseRow.assessment_regime} isFaceless={caseRow.is_faceless} />
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

      <div className="border-b border-navy-100 mb-5">
        <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Case sections">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cx(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors',
                  active
                    ? 'border-navy-900 text-navy-900 font-medium'
                    : 'border-transparent text-navy-600 hover:text-navy-900',
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </nav>
      </div>

      {tab === 'notice' && <NoticeTab caseRow={caseRow} guidance={referenceGuidance} events={events} notice={notice} />}
      {tab === 'documents' && <DocumentsTab caseRow={caseRow} checklist={checklist} magicLink={magicLink} uploads={uploads} />}
      {tab === 'reconciliation' && <ReconciliationTab caseRow={caseRow} financials={clientFinancials} />}
      {tab === 'research' && <ResearchTab caseRow={caseRow} guidance={referenceGuidance} triage={triage} />}
      {tab === 'response' && <ResponseTab caseRow={caseRow} triage={triage} checklist={checklist} guidance={referenceGuidance} />}
    </div>
  )
}
