import { BookOpen, Scale, FileSearch } from 'lucide-react'

export default function ResearchTab({ guidance, triage }) {
  const acts = guidance?.act_references || []
  const triageMapping = triage?.section_mapping || []
  const rules = guidance?.relevant_rules || []

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-cream-200 text-navy-800 grid place-items-center">
            <Scale className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-medium text-navy-900">
              Legal research
            </h3>
            <p className="text-sm text-navy-600 mt-0.5">
              Sections cited in the notice, mapped between the 1961 and 2025 Acts, with the
              applicable Income Tax Rules — so you start your research with the law already laid out.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="font-display text-sm font-medium text-navy-900 mb-3 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" /> Act references (1961 ↔ 2025)
        </h4>
        {acts.length === 0 && triageMapping.length === 0 ? (
          <div className="text-sm text-navy-500">
            No act references extracted. Run AI triage or re-extract the notice.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-navy-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-100 text-label uppercase tracking-wider text-navy-600">
                  <th className="px-3 py-1.5 text-left">Cited section</th>
                  <th className="px-3 py-1.5 text-left">Source act</th>
                  <th className="px-3 py-1.5 text-left">Equivalent section</th>
                  <th className="px-3 py-1.5 text-left">Topic</th>
                </tr>
              </thead>
              <tbody>
                {acts.map((a, i) => (
                  <tr key={`a-${i}`} className="border-t border-navy-50">
                    <td className="px-3 py-1.5 font-mono text-navy-800">{a.section_cited}</td>
                    <td className="px-3 py-1.5 font-mono text-navy-700">IT Act {a.act_version}</td>
                    <td className="px-3 py-1.5 font-mono text-navy-800">
                      {a.equivalent_section} <span className="text-navy-500">({a.act_version === '1961' ? '2025' : '1961'})</span>
                    </td>
                    <td className="px-3 py-1.5 text-navy-700">{a.topic}</td>
                  </tr>
                ))}
                {triageMapping.map((m, i) => (
                  <tr key={`t-${i}`} className="border-t border-navy-50">
                    <td className="px-3 py-1.5 font-mono text-navy-800">{m.act_1961}</td>
                    <td className="px-3 py-1.5 font-mono text-navy-700">IT Act 1961</td>
                    <td className="px-3 py-1.5 font-mono text-navy-800">
                      {m.act_2025} <span className="text-navy-500">(2025)</span>
                    </td>
                    <td className="px-3 py-1.5 text-navy-700">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rules.length > 0 && (
        <div className="card p-5">
          <h4 className="font-display text-sm font-medium text-navy-900 mb-2 flex items-center gap-1.5">
            <FileSearch className="h-3.5 w-3.5" /> Relevant Income Tax Rules
          </h4>
          <div className="flex flex-wrap gap-2">
            {rules.map((rule, i) => (
              <span key={i} className="rounded border border-navy-100 bg-cream-50 px-2 py-0.5 text-xs font-mono text-navy-800">
                {rule}
              </span>
            ))}
          </div>
        </div>
      )}

      {guidance?.faceless_procedure_notes && (
        <div className="card p-5">
          <h4 className="font-display text-sm font-medium text-navy-900 mb-1.5">
            Procedure notes
          </h4>
          <p className="text-sm text-navy-700 leading-relaxed">{guidance.faceless_procedure_notes}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border border-navy-100 bg-cream-50 px-2 py-0.5 text-navy-700">
              Format: <span className="font-medium">{guidance.response_format || '—'}</span>
            </span>
            <span className="rounded border border-navy-100 bg-cream-50 px-2 py-0.5 text-navy-700">
              DSC required: <span className="font-medium">{guidance.requires_dsc ? 'Yes' : 'No'}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
