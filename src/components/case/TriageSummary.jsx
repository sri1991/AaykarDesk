import { useState } from 'react'
import { Sparkles, Loader2, AlertOctagon, ShieldAlert, ShieldCheck, BookOpen } from 'lucide-react'
import { triageCase } from '../../lib/gemini.js'
import { demoStore } from '../../lib/demoStore.js'
import { cx } from '../../lib/utils.js'

const RISK_STYLES = {
  high: { cls: 'border-red-200 bg-red-50 text-red-900', icon: AlertOctagon, label: 'High risk' },
  medium: { cls: 'border-amber-200 bg-amber-50 text-amber-900', icon: ShieldAlert, label: 'Medium risk' },
  low: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: ShieldCheck, label: 'Low risk' },
}

const SEVERITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

const FALLBACK_TRIAGE = (caseRow) => ({
  risk_assessment: 'medium',
  summary: `Notice u/s ${caseRow.notice_section || 'XX'} for AY ${caseRow.assessment_year} raises issues consistent with a routine scrutiny review. Initial document set is sufficient to draft a preliminary response. Recommend cross-verifying Form 26AS, AIS and TIS against books before filing. No coercive demand has crystallised.`,
  discrepancies: [
    { title: 'Mismatch between AIS and books', severity: 'medium', detail: 'Two interest entries appear in AIS but not in books — reconcile or explain.' },
    { title: 'Cash deposits during demonetisation window', severity: 'low', detail: 'Below ₹2L threshold, but document the source.' },
  ],
  section_mapping: [
    { act_1961: caseRow.notice_section || '143(2)', act_2025: '147', note: 'Scrutiny power retained with revised timelines' },
    { act_1961: '142(1)', act_2025: '146', note: 'Inquiry before assessment — analogue retained' },
  ],
  draft_response: `Sir/Madam,\n\nWith reference to the notice dated ___ issued u/s ${caseRow.notice_section || '143(2)'} for AY ${caseRow.assessment_year}, please find enclosed the requested documents and our submissions. The assessee submits that all transactions are duly recorded in audited books and reflected in the return filed.\n\nA point-wise reply to each query is annexed.\n\nFor and on behalf of the assessee.`,
})

export default function TriageSummary({ caseRow, triage, checklist }) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const runTriage = async () => {
    setRunning(true)
    setError(null)
    try {
      const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
      let result
      if (!hasKey) {
        await new Promise((r) => setTimeout(r, 1500))
        result = FALLBACK_TRIAGE(caseRow)
      } else {
        const ctx = {
          notice_section: caseRow.notice_section,
          assessment_year: caseRow.assessment_year,
          notice_type: caseRow.notice_type,
          documents_uploaded: checklist
            .filter((i) => i.status === 'uploaded' || i.status === 'verified')
            .map((i) => i.document_name),
          documents_pending: checklist
            .filter((i) => i.status === 'pending')
            .map((i) => i.document_name),
        }
        const r = await triageCase(ctx)
        result = r.result
      }
      demoStore.setTriage(caseRow.id, result)
    } catch (err) {
      setError(err.message || 'Triage failed')
    } finally {
      setRunning(false)
    }
  }

  if (!triage) {
    return (
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-cream-200 text-navy-800 grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-medium text-navy-900">
              AI Triage briefing
            </h3>
            <p className="text-sm text-navy-600 mt-0.5">
              Run a Gemini Pro analysis of the notice and uploaded documents — discrepancies, section mapping (1961↔2025), risk and a draft response.
            </p>
            {error && (
              <div className="mt-2 text-sm text-red-700">{error}</div>
            )}
            <button onClick={runTriage} disabled={running} className="btn-primary mt-3">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {running ? 'Analysing…' : 'Run AI triage'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const risk = RISK_STYLES[triage.risk_assessment] || RISK_STYLES.medium
  const RiskIcon = risk.icon

  return (
    <div className="card overflow-hidden">
      <div className={cx('flex items-center gap-2 px-4 py-2.5 border-b', risk.cls)}>
        <RiskIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{risk.label}</span>
        <span className="ml-auto text-xs">AI briefing · Gemini 1.5 Pro</span>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-navy-800 leading-relaxed">{triage.summary}</p>

        <div>
          <h4 className="font-display text-sm font-medium text-navy-900 mb-2">
            Discrepancies identified
          </h4>
          <ul className="space-y-2">
            {(triage.discrepancies || []).map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-md border border-navy-100 bg-cream-50 px-3 py-2">
                <span className={cx('mt-1.5 h-2 w-2 rounded-full shrink-0', SEVERITY_DOT[d.severity] || 'bg-navy-400')} />
                <div>
                  <div className="text-sm font-medium text-navy-900">{d.title}</div>
                  <div className="text-xs text-navy-600">{d.detail}</div>
                </div>
              </li>
            ))}
            {(!triage.discrepancies || triage.discrepancies.length === 0) && (
              <li className="text-sm text-navy-500">No discrepancies flagged.</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-medium text-navy-900 mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Section mapping (1961 ↔ 2025)
          </h4>
          <div className="overflow-x-auto rounded-md border border-navy-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-100 text-label uppercase tracking-wider text-navy-600">
                  <th className="px-3 py-1.5 text-left">1961 Act</th>
                  <th className="px-3 py-1.5 text-left">2025 Act</th>
                  <th className="px-3 py-1.5 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {(triage.section_mapping || []).map((m, i) => (
                  <tr key={i} className="border-t border-navy-50">
                    <td className="px-3 py-1.5 font-mono text-navy-800">{m.act_1961}</td>
                    <td className="px-3 py-1.5 font-mono text-navy-800">{m.act_2025}</td>
                    <td className="px-3 py-1.5 text-navy-700">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {triage.draft_response && (
          <div>
            <h4 className="font-display text-sm font-medium text-navy-900 mb-2">
              Draft response (template)
            </h4>
            <pre className="rounded-md border border-navy-100 bg-cream-50 px-3 py-2 text-xs text-navy-800 whitespace-pre-wrap font-body leading-relaxed">
{triage.draft_response}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
