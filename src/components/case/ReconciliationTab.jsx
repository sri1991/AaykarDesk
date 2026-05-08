import { ArrowLeftRight, AlertTriangle, FileSpreadsheet, Database } from 'lucide-react'
import { cx } from '../../lib/utils.js'

function formatValue(v) {
  if (v == null) return '—'
  if (typeof v === 'number') return new Intl.NumberFormat('en-IN').format(v)
  return String(v)
}

function isMismatch(left, right) {
  if (left == null || right == null) return false
  if (typeof left === 'number' && typeof right === 'number') {
    if (left === 0 && right === 0) return false
    return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right)) > 0.005
  }
  return String(left).trim() !== String(right).trim()
}

export default function ReconciliationTab({ caseRow, financials }) {
  const records = financials || []
  const tallyStatus = caseRow.tally_import_status || 'none'

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-cream-200 text-navy-800 grid place-items-center">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-medium text-navy-900">
              Reconciliation
            </h3>
            <p className="text-sm text-navy-600 mt-0.5">
              Side-by-side comparison of figures stated in the notice / 26AS against the client's books.
              Mismatches are highlighted in red.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-xs">
              <Database className="h-3.5 w-3.5" /> Import Tally XML
            </button>
            <button className="btn-ghost text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Upload 26AS / AIS
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-navy-600">
          <span className="rounded border border-navy-100 bg-cream-50 px-2 py-0.5">
            Tally import: <span className="font-medium text-navy-800">{tallyStatus}</span>
          </span>
          {caseRow.tally_company_name && (
            <span className="rounded border border-navy-100 bg-cream-50 px-2 py-0.5">
              Tally company: <span className="font-medium text-navy-800">{caseRow.tally_company_name}</span>
            </span>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-cream-100 grid place-items-center">
            <ArrowLeftRight className="h-5 w-5 text-navy-500" />
          </div>
          <h4 className="font-display text-sm font-medium text-navy-900 mt-3">
            No financial data imported yet
          </h4>
          <p className="text-sm text-navy-600 mt-1 max-w-md mx-auto">
            Import a Tally XML export, paste a 26AS JSON, or enter figures manually to see the
            side-by-side reconciliation here.
          </p>
        </div>
      ) : (
        records.map((rec) => (
          <div key={rec.id} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-100 px-4 py-2.5">
              <div>
                <div className="font-display text-sm font-medium text-navy-900">
                  {rec.data_type.replace(/_/g, ' ')}
                </div>
                <div className="text-xs text-navy-500">
                  AY {rec.assessment_year || '—'} · source: {rec.source}
                </div>
              </div>
              <span className="text-[11px] font-mono text-navy-500">
                imported {new Date(rec.imported_at || rec.period_to || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-100 text-label uppercase tracking-wider text-navy-600">
                    <th className="px-3 py-1.5 text-left">Line item</th>
                    <th className="px-3 py-1.5 text-right">As per Notice / 26AS</th>
                    <th className="px-3 py-1.5 text-right">As per Client Records</th>
                    <th className="px-3 py-1.5 text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {(rec.data?.rows || []).map((row, i) => {
                    const mismatch = isMismatch(row.notice, row.books)
                    const delta =
                      typeof row.notice === 'number' && typeof row.books === 'number'
                        ? row.books - row.notice
                        : null
                    return (
                      <tr key={i} className={cx('border-t border-navy-50', mismatch && 'bg-red-50/50')}>
                        <td className="px-3 py-1.5 text-navy-800">{row.label}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-navy-800">{formatValue(row.notice)}</td>
                        <td className={cx('px-3 py-1.5 text-right font-mono', mismatch ? 'text-red-800 font-medium' : 'text-navy-800')}>
                          {formatValue(row.books)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-navy-600">
                          {delta != null ? (
                            <span className={cx('inline-flex items-center gap-1', mismatch && 'text-red-700')}>
                              {mismatch && <AlertTriangle className="h-3 w-3" />}
                              {delta > 0 ? '+' : ''}{formatValue(delta)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
