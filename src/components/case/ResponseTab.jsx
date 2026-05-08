import { FileText, Download, ExternalLink, Sparkles } from 'lucide-react'
import TriageSummary from './TriageSummary.jsx'

export default function ResponseTab({ caseRow, triage, checklist, guidance }) {
  const draft = triage?.draft_response
  const portalHref = 'https://www.incometax.gov.in/iec/foportal/'

  const downloadDraft = () => {
    if (!draft) return
    const blob = new Blob([draft], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${caseRow.case_number || caseRow.client_name}-response.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-cream-200 text-navy-800 grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-medium text-navy-900">
              Response (Phase 2)
            </h3>
            <p className="text-sm text-navy-600 mt-0.5">
              Generate a templated draft response, download as Word, and open the IT portal
              e-Proceedings tab to file it.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={downloadDraft} disabled={!draft} className="btn-primary disabled:opacity-50">
                <Download className="h-4 w-4" /> Download draft (.doc)
              </button>
              <a className="btn-ghost" href={portalHref} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Open IT Portal e-Proceedings
              </a>
              {guidance?.requires_dsc && (
                <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                  DSC required for filing
                </span>
              )}
            </div>
          </div>
        </div>
        {draft && (
          <pre className="mt-4 rounded-md border border-navy-100 bg-cream-50 px-3 py-3 text-xs text-navy-800 whitespace-pre-wrap font-body leading-relaxed">
{draft}
          </pre>
        )}
        {!draft && (
          <div className="mt-4 rounded-md border border-dashed border-navy-200 bg-cream-100 px-4 py-6 text-center text-sm text-navy-600 flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Run AI triage below to generate a draft response.
          </div>
        )}
      </div>

      <TriageSummary caseRow={caseRow} triage={triage} checklist={checklist} />
    </div>
  )
}
