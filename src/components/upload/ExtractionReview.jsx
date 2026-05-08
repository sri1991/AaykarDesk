import { CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { cx, isValidPan } from '../../lib/utils.js'

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

export default function ExtractionReview({ data, onChange }) {
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
        { name: '', description: '', is_mandatory: true, tally_exportable: false, suggested_source: 'client_records' },
      ],
    })

  const SOURCE_OPTIONS = [
    { value: 'tally', label: 'Tally' },
    { value: 'bank', label: 'Bank' },
    { value: 'employer', label: 'Employer' },
    { value: 'client_records', label: 'Client records' },
    { value: 'government_portal', label: 'IT portal' },
  ]
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
        <div className="space-y-2">
          {(data.documents_requested || []).map((doc, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded-md border border-navy-100 bg-white p-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                <input
                  className="input md:col-span-4"
                  placeholder="Document name"
                  value={doc.name || ''}
                  onChange={(e) => updateDoc(idx, { name: e.target.value })}
                />
                <input
                  className="input md:col-span-4"
                  placeholder="Description / period"
                  value={doc.description || ''}
                  onChange={(e) => updateDoc(idx, { description: e.target.value })}
                />
                <select
                  className="input md:col-span-3"
                  value={doc.suggested_source || 'client_records'}
                  onChange={(e) => updateDoc(idx, { suggested_source: e.target.value })}
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <label className="md:col-span-1 flex flex-col items-center justify-center text-[10px] uppercase tracking-wider text-navy-600 gap-0.5">
                  <input
                    type="checkbox"
                    checked={doc.tally_exportable === true}
                    onChange={(e) => updateDoc(idx, { tally_exportable: e.target.checked })}
                  />
                  Tally
                </label>
              </div>
              <label className="flex items-center text-[10px] uppercase tracking-wider text-navy-600 gap-1 pt-2">
                <input
                  type="checkbox"
                  checked={doc.is_mandatory !== false}
                  onChange={(e) => updateDoc(idx, { is_mandatory: e.target.checked })}
                />
                Mand.
              </label>
              <button onClick={() => removeDoc(idx)} className="btn-ghost px-2">
                <Trash2 className="h-4 w-4 text-navy-500" />
              </button>
            </div>
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
