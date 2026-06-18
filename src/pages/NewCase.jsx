import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import NoticeUpload from '../components/upload/NoticeUpload.jsx'
import ExtractionReview from '../components/upload/ExtractionReview.jsx'
import CaseCreateForm from '../components/upload/CaseCreateForm.jsx'
import { extractNoticeFromPdf, generateNoticeSummary, isSummaryWhitelisted } from '../lib/gemini.js'
import { createCase } from '../lib/api.js'
import { cx } from '../lib/utils.js'

// Canned client summaries used in demo mode (no Gemini key) so the flow always
// produces a reviewable draft for whitelisted notice types.
function sampleNoticeSummary(section, ay = 'the relevant year') {
  const s = String(section || '')
  if (s.startsWith('143(1)') || s.startsWith('245')) {
    return `The Income Tax Department has processed your tax return for AY ${ay} and found a difference between what you filed and their records. They are asking for additional tax, or for documents that support what you originally filed. Your CA is reviewing the notice and will decide the right response. The documents below are needed to verify the figures in your return and decide whether the demand is correct or should be challenged.`
  }
  // 143(2), 139(9) and other whitelisted scrutiny-style notices
  return `The Income Tax Department has selected your tax return for AY ${ay} for a detailed review. This is a routine process — being selected does not mean you've done anything wrong. The department simply wants to verify some of the information in your return. Your CA is handling the response on your behalf and needs the documents listed below to prepare the reply. Once you upload everything, your CA will review and submit the response before the deadline.`
}

const STEPS = [
  { key: 'upload', label: 'Upload notice' },
  { key: 'review', label: 'Review extraction' },
  { key: 'confirm', label: 'Create case' },
]

const SAMPLE_EXTRACTION = {
  notice_section: '143(2)',
  notice_type: 'scrutiny',
  assessment_year: '2023-24',
  client_name: 'Acme Industries Pvt Ltd',
  client_pan: 'AABCA1234F',
  ao_name: 'Shri R. Krishnan',
  ward_circle: 'Circle 3(1)(1)',
  jurisdiction: 'Chennai',
  issue_date: new Date().toISOString().slice(0, 10),
  compliance_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  deadline_type: 'statutory',
  priority: 'high',
  client_email: '',
  client_phone: '',
  is_faceless: true,
  assessment_regime: 'faceless',
  client_notice_summary:
    "The Income Tax Department has selected your tax return for AY 2023-24 for a detailed review. This is a routine process — being selected does not mean you've done anything wrong. The department simply wants to verify some of the information in your return. Your CA is handling the response on your behalf and needs the documents listed below to prepare the reply. Once you upload everything, your CA will review and submit the response before the deadline.",
  show_notice_summary: true,
  documents_requested: [
    { name: 'Audited financial statements FY 2022-23', description: 'P&L, B/S, schedules', is_mandatory: true, tally_exportable: true, suggested_source: 'tally' },
    { name: 'Bank statements — all current accounts', description: 'Apr 2022 to Mar 2023', is_mandatory: true, tally_exportable: false, suggested_source: 'bank' },
    { name: 'GSTR-1 / 3B reconciliations', description: 'Quarterly', is_mandatory: true, tally_exportable: true, suggested_source: 'tally' },
    { name: 'Sundry creditors confirmation', description: 'Top 10 by balance', is_mandatory: true, tally_exportable: false, suggested_source: 'client_records' },
    { name: 'Sample purchase invoices', description: '15 highest value', is_mandatory: false, tally_exportable: true, suggested_source: 'tally' },
    { name: 'Form 26AS', description: 'AY 2023-24 tax credit statement', is_mandatory: true, tally_exportable: false, suggested_source: 'government_portal' },
  ],
  act_references: [
    { section_cited: '143(2)', act_version: '1961', equivalent_section: '270', topic: 'Selection for scrutiny assessment' },
  ],
  reference_guidance: {
    response_format: 'e_proceeding_portal',
    requires_dsc: true,
    faceless_procedure_notes: 'Reply must be filed via e-Proceedings on the IT portal. No physical hearing unless specifically requested under the Faceless Assessment Scheme.',
    relevant_rules: ['Rule 12', 'Rule 14C'],
    taxmann_search_query: '143(2) faceless scrutiny limited disallowance partner remuneration',
  },
  confidence: { overall: 0.92, deadline: 0.88, section: 0.95, faceless_detection: 0.97 },
}

export default function NewCase() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [data, setData] = useState(null)
  const [creating, setCreating] = useState(false)

  const runExtraction = async () => {
    if (!file) return
    setExtracting(true)
    setExtractError(null)
    try {
      const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
      if (!hasKey) {
        await new Promise((r) => setTimeout(r, 1200))
        setData({ ...SAMPLE_EXTRACTION })
      } else {
        const { result } = await extractNoticeFromPdf(file)
        const deadline =
          result.compliance_date ||
          result.deadline ||
          (result.issue_date
            ? new Date(new Date(result.issue_date).getTime() + 14 * 86400000)
                .toISOString()
                .slice(0, 10)
            : null)
        // Limited rollout: only keep an auto-generated client summary for
        // whitelisted notice types; otherwise leave it for the CA to write.
        const client_notice_summary = isSummaryWhitelisted(result.notice_section)
          ? result.client_notice_summary || ''
          : ''
        setData({
          ...result,
          deadline,
          priority: result.priority || 'high',
          client_notice_summary,
          show_notice_summary: result.show_notice_summary !== false,
        })
      }
      setStep(1)
    } catch (err) {
      setExtractError(err.message || 'Extraction failed')
    } finally {
      setExtracting(false)
    }
  }

  const [regenerating, setRegenerating] = useState(false)
  const handleRegenerateSummary = async () => {
    if (!data) return
    if (!isSummaryWhitelisted(data.notice_section)) {
      alert(
        'Auto-generation is currently limited to notice types 143(1), 143(2), 245 and 139(9). Please write the summary manually for this notice.',
      )
      return
    }
    setRegenerating(true)
    try {
      const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
      let summary
      if (hasKey) {
        summary = await generateNoticeSummary({
          notice_section: data.notice_section,
          notice_type: data.notice_type,
          assessment_year: data.assessment_year,
          key_issues: data.key_issues,
          amount_involved: data.amount_involved,
        })
      } else {
        await new Promise((r) => setTimeout(r, 700))
        summary = sampleNoticeSummary(data.notice_section, data.assessment_year)
      }
      setData((d) => ({ ...d, client_notice_summary: summary }))
    } catch (err) {
      alert(err.message || 'Could not regenerate the summary.')
    } finally {
      setRegenerating(false)
    }
  }

  const [createError, setCreateError] = useState(null)
  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const created = await createCase(data, file)
      navigate(`/cases/${created.id}`)
    } catch (err) {
      setCreateError(err.message || 'Could not create the case. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy-900">New Case</h1>
          <p className="text-sm text-navy-600 mt-0.5">
            Upload an income tax notice. AI extracts key fields, then you confirm and create the case.
          </p>
        </div>
      </div>

      <ol className="flex items-center gap-3 mb-6">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cx(
                'h-6 w-6 grid place-items-center rounded-full text-xs font-medium border',
                i < step
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : i === step
                  ? 'bg-navy-900 text-cream-50 border-navy-900'
                  : 'bg-white text-navy-500 border-navy-200',
              )}
            >
              {i + 1}
            </span>
            <span
              className={cx(
                'text-sm',
                i === step ? 'font-medium text-navy-900' : 'text-navy-600',
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-navy-200" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="card p-5">
          <NoticeUpload file={file} onFile={setFile} error={extractError} />
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => navigate('/cases')} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Cancel
            </button>
            <button
              onClick={runExtraction}
              disabled={!file || extracting}
              className="btn-primary"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Extracting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Extract with AI
                </>
              )}
            </button>
          </div>
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <p className="mt-3 text-xs text-navy-500">
              No Gemini API key configured — a representative sample extraction will be used for demo.
            </p>
          )}
        </div>
      )}

      {step === 1 && data && (
        <div className="card p-5">
          <ExtractionReview
            data={data}
            onChange={setData}
            onRegenerateSummary={handleRegenerateSummary}
            regeneratingSummary={regenerating}
          />
          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => setStep(0)} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={() => setStep(2)} className="btn-primary">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && data && (
        <div>
          {createError && (
            <div className="mb-4 rounded-md border border-urgency-high/30 bg-urgency-high/5 px-3 py-2 text-sm text-urgency-high">
              {createError}
            </div>
          )}
          <CaseCreateForm data={data} onCreate={handleCreate} isCreating={creating} />
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => setStep(1)} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back to review
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
