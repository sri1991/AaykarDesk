import { CheckCircle2, AlertCircle, Plus, Trash2, Sparkles, Loader2, Eye } from 'lucide-react'
import {
  cx,
  isValidPan,
  normalizeFileTypes,
  defaultAcceptedFileTypes,
  acceptedTypesLabel,
  FILE_TYPE_META,
} from '../../lib/utils.js'

const FILE_TYPE_CHOICES = ['pdf', 'jpg', 'png', 'heic', 'xlsx', 'csv']

function ConfidencePill({ value }) {
  if (value == null) return null
  const tone =
    value >= 0.85
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : value >= 0.6
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-red-50 text-red-800 border-red-200'
  return (
    <span className={cx('ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium', tone)}>
      {value >= 0.85 ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {Math.round(value * 100)}%
    </span>
  )
}

function Field({ label, children, confidence }) {
  return (
    <div>
      <label className="label flex items-center">
        {label}
        <ConfidencePill value={confidence} />
      </label>
      {children}
    </div>
  )
}

// Toggle chips for the accepted file types of a document slot (Enhancement 2).
function FileTypeChips({ value, onChange }) {
  const selected = new Set(normalizeFileTypes(value))
  const toggle = (t) => {
    const next = new Set(selected)
    if (next.has(t)) next.delete(t)
    else next.add(t)
    onChange(Array.from(next))
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILE_TYPE_CHOICES.map((t) => {
        const on = selected.has(t)
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={cx(
              'rounded-full border px-2 py-0.5 text-[11px] font-medium transition',
              on
                ? 'border-navy-900 bg-navy-900 text-cream-50'
                : 'border-navy-200 bg-white text-navy-600 hover:bg-cream-100',
            )}
          >
            {FILE_TYPE_META[t]?.label || t.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

const SOURCE_OPTIONS = [
  { value: 'tally', label: 'Tally' },
  { value: 'bank', label: 'Bank' },
  { value: 'employer', label: 'Employer' },
  { value: 'client_records', label: 'Client records' },
  { value: 'government_portal', label: 'IT portal' },
]

function DocumentRow({ doc, idx, onChange, onRemove }) {
  const update = (patch) => onChange(idx, patch)
  const acceptedTypes = doc.accepted_file_types?.length
    ? doc.accepted_file_types
    : defaultAcceptedFileTypes(doc)
  const clientDescription = doc.client_description ?? doc.description ?? ''
  const shareReasoning = doc.share_reasoning_with_client === true

  return (
    <div className="rounded-md border border-navy-100 bg-white p-3 space-y-2.5">
      <div className="flex items-start gap-2">
        <span className="text-navy-400 font-mono text-xs pt-2">{String(idx + 1).padStart(2, '0')}</span>
        <input
          className="input flex-1"
          placeholder="Document title (shown to client)"
          value={doc.name || ''}
          onChange={(e) => update({ name: e.target.value })}
        />
        <select
          className="input w-36 shrink-0"
          value={doc.suggested_source || 'client_records'}
          onChange={(e) => update({ suggested_source: e.target.value })}
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button onClick={() => onRemove(idx)} className="btn-ghost px-2 pt-1.5 shrink-0" title="Remove">
          <Trash2 className="h-4 w-4 text-navy-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pl-6">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-navy-500">
            Client description (always shown)
          </label>
          <textarea
            className="input min-h-[58px] resize-y"
            placeholder="Plain, action-oriented instruction for the client"
            value={clientDescription}
            onChange={(e) => update({ client_description: e.target.value, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-navy-500">
            Internal reasoning (CA only)
          </label>
          <textarea
            className="input min-h-[58px] resize-y"
            placeholder="Analytical context — e.g. ITR vs 26AS gap. Hidden unless shared."
            value={doc.internal_reasoning || ''}
            onChange={(e) => update({ internal_reasoning: e.target.value })}
          />
        </div>
      </div>

      <div className="pl-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="flex items-center gap-1.5 text-xs text-navy-700">
          <input
            type="checkbox"
            checked={doc.is_mandatory !== false}
            onChange={(e) => update({ is_mandatory: e.target.checked })}
          />
          Required
        </label>
        <label className="flex items-center gap-1.5 text-xs text-navy-700">
          <input
            type="checkbox"
            checked={doc.tally_exportable === true}
            onChange={(e) => update({ tally_exportable: e.target.checked })}
          />
          Available in Tally
        </label>
        <label className="flex items-center gap-1.5 text-xs text-navy-700">
          <input
            type="checkbox"
            checked={shareReasoning}
            onChange={(e) => update({ share_reasoning_with_client: e.target.checked })}
          />
          Share reasoning with client
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-navy-500">Accepts</span>
          <FileTypeChips value={acceptedTypes} onChange={(v) => update({ accepted_file_types: v })} />
        </div>
      </div>

      <div className="pl-6">
        <div className="rounded border border-dashed border-navy-200 bg-cream-50 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-navy-500 mb-1">
            <Eye className="h-3 w-3" /> Client sees
          </div>
          <div className="text-xs text-navy-700">{clientDescription || '—'}</div>
          {shareReasoning && doc.internal_reasoning && (
            <div className="mt-1 text-xs text-navy-600">
              <span className="font-medium text-navy-700">Why this is needed: </span>
              {doc.internal_reasoning}
            </div>
          )}
          <div className="mt-1 text-[11px] text-navy-500">Accepts: {acceptedTypesLabel(acceptedTypes)}</div>
        </div>
      </div>
    </div>
  )
}

function NoticeSummaryEditor({ data, update, onRegenerate, regenerating }) {
  const value = data.client_notice_summary || ''
  const len = value.length
  const inRange = len >= 300 && len <= 500
  const show = data.show_notice_summary !== false

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between">
        <label className="label">Plain-language notice summary (shown to client)</label>
        {value && (
          <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
            <Sparkles className="h-3 w-3" /> AI-generated draft — please verify before sending
          </span>
        )}
      </div>
      <textarea
        className="input min-h-[120px] resize-y"
        placeholder="A warm, calm, factual explanation of the notice for the client (no jargon, no legal advice)."
        value={value}
        onChange={(e) => update({ client_notice_summary: e.target.value })}
      />
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs text-navy-700">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => update({ show_notice_summary: e.target.checked })}
          />
          Show this explanation to the client
        </label>
        <div className="flex items-center gap-3">
          <span className={cx('text-[11px]', inRange ? 'text-emerald-700' : 'text-navy-500')}>
            {len} chars · recommended 300–500
          </span>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="btn-ghost text-xs"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Regenerating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Regenerate
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {!value && (
        <p className="mt-1 text-[11px] text-navy-500">
          No summary generated for this notice type. Write one manually, or leave blank to hide it.
        </p>
      )}
    </div>
  )
}

export default function ExtractionReview({ data, onChange, onRegenerateSummary, regeneratingSummary }) {
  const update = (patch) => onChange({ ...data, ...patch })
  const updateDoc = (idx, patch) => {
    const docs = [...(data.documents_requested || [])]
    docs[idx] = { ...docs[idx], ...patch }
    update({ documents_requested: docs })
  }
  const addDoc = () =>
    update({
      documents_requested: [
        ...(data.documents_requested || []),
        {
          name: '',
          client_description: '',
          internal_reasoning: '',
          share_reasoning_with_client: false,
          is_mandatory: true,
          tally_exportable: false,
          suggested_source: 'client_records',
          accepted_file_types: ['pdf', 'jpg', 'png'],
        },
      ],
    })
  const removeDoc = (idx) => {
    const docs = [...(data.documents_requested || [])]
    docs.splice(idx, 1)
    update({ documents_requested: docs })
  }

  const conf = data.confidence || {}
  const panInvalid = data.client_pan && !isValidPan(data.client_pan)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Client name" confidence={conf.overall}>
        <input
          className="input"
          value={data.client_name || ''}
          onChange={(e) => update({ client_name: e.target.value })}
        />
      </Field>
      <Field label="Client PAN">
        <input
          className={cx('input font-mono uppercase', panInvalid && 'border-red-300')}
          value={data.client_pan || ''}
          onChange={(e) => update({ client_pan: e.target.value.toUpperCase() })}
          placeholder="ABCDE1234F"
        />
        {panInvalid && (
          <div className="text-xs text-red-700 mt-1">Invalid PAN format</div>
        )}
      </Field>

      <Field label="Notice section" confidence={conf.section}>
        <input
          className="input font-mono"
          value={data.notice_section || ''}
          onChange={(e) => update({ notice_section: e.target.value })}
          placeholder="143(2)"
        />
      </Field>
      <Field label="Notice type">
        <select
          className="input"
          value={data.notice_type || ''}
          onChange={(e) => update({ notice_type: e.target.value })}
        >
          <option value="">Select…</option>
          <option value="scrutiny">Scrutiny</option>
          <option value="reassessment">Reassessment</option>
          <option value="demand">Demand</option>
          <option value="penalty">Penalty</option>
          <option value="rectification">Rectification</option>
        </select>
      </Field>

      <Field label="Assessment year">
        <input
          className="input font-mono"
          value={data.assessment_year || ''}
          onChange={(e) => update({ assessment_year: e.target.value })}
          placeholder="2024-25"
        />
      </Field>
      <Field label="Compliance deadline" confidence={conf.deadline}>
        <input
          type="date"
          className="input font-mono"
          value={data.deadline || ''}
          onChange={(e) => update({ deadline: e.target.value })}
        />
      </Field>

      <Field label="Assessing Officer">
        <input
          className="input"
          value={data.ao_name || ''}
          onChange={(e) => update({ ao_name: e.target.value })}
        />
      </Field>
      <Field label="Ward / Circle">
        <input
          className="input"
          value={data.ward_circle || ''}
          onChange={(e) => update({ ward_circle: e.target.value })}
        />
      </Field>

      <Field label="Jurisdiction">
        <input
          className="input"
          value={data.jurisdiction || ''}
          onChange={(e) => update({ jurisdiction: e.target.value })}
        />
      </Field>
      <Field label="Priority">
        <select
          className="input"
          value={data.priority || 'medium'}
          onChange={(e) => update({ priority: e.target.value })}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </Field>

      <Field label="Assessment regime" confidence={conf.faceless_detection}>
        <select
          className="input"
          value={data.assessment_regime || (data.is_faceless ? 'faceless' : 'jurisdictional')}
          onChange={(e) =>
            update({
              assessment_regime: e.target.value,
              is_faceless: e.target.value === 'faceless',
            })
          }
        >
          <option value="faceless">Faceless (NaFAC)</option>
          <option value="jurisdictional">Jurisdictional</option>
          <option value="transfer_pricing">Transfer pricing</option>
          <option value="search_case">Search case</option>
        </select>
      </Field>
      <Field label="Faceless assessment">
        <label className="flex items-center gap-2 h-9 px-3 rounded border border-navy-200 bg-white text-sm text-navy-800">
          <input
            type="checkbox"
            checked={data.is_faceless !== false}
            onChange={(e) =>
              update({
                is_faceless: e.target.checked,
                assessment_regime: e.target.checked ? 'faceless' : 'jurisdictional',
              })
            }
          />
          Issued under Faceless Assessment Scheme
        </label>
      </Field>

      <NoticeSummaryEditor
        data={data}
        update={update}
        onRegenerate={onRegenerateSummary}
        regenerating={regeneratingSummary}
      />

      <div className="md:col-span-2">
        <label className="label">Client contact (for magic link)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="client@example.com"
            value={data.client_email || ''}
            onChange={(e) => update({ client_email: e.target.value })}
          />
          <input
            className="input font-mono"
            placeholder="+91 98xxxxxxxx"
            value={data.client_phone || ''}
            onChange={(e) => update({ client_phone: e.target.value })}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between">
          <label className="label">Document checklist (extracted from annexure)</label>
          <button onClick={addDoc} className="btn-ghost text-xs">
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>
        <div className="space-y-2.5">
          {(data.documents_requested || []).map((doc, idx) => (
            <DocumentRow
              key={idx}
              doc={doc}
              idx={idx}
              onChange={updateDoc}
              onRemove={removeDoc}
            />
          ))}
          {(data.documents_requested || []).length === 0 && (
            <div className="rounded-md border border-dashed border-navy-200 bg-cream-100 px-4 py-6 text-center text-sm text-navy-600">
              No documents extracted. Add items the annexure requested.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
