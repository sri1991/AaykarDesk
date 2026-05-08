import { FileText, UploadCloud, Sparkles, Link2, FilePlus2 } from 'lucide-react'
import { formatDateTime } from '../../lib/utils.js'

const ICONS = {
  case_created: FilePlus2,
  notice_uploaded: FileText,
  link_shared: Link2,
  doc_uploaded: UploadCloud,
  triage_complete: Sparkles,
}

export default function CaseTimeline({ events }) {
  return (
    <div className="card">
      <div className="border-b border-navy-100 px-4 py-3">
        <h3 className="font-display text-base font-medium text-navy-900">Activity timeline</h3>
      </div>
      <ol className="px-4 py-4 space-y-4">
        {events.map((ev, i) => {
          const Icon = ICONS[ev.type] || FileText
          return (
            <li key={i} className="flex gap-3">
              <div className="relative">
                <div className="h-7 w-7 rounded-full bg-cream-200 text-navy-700 grid place-items-center">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {i < events.length - 1 && (
                  <div className="absolute left-1/2 top-7 -translate-x-1/2 w-px h-full bg-navy-100" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="text-sm text-navy-900">{ev.title}</div>
                {ev.detail && <div className="text-xs text-navy-600 mt-0.5">{ev.detail}</div>}
                <div className="text-xs text-navy-400 mt-1 font-mono">{formatDateTime(ev.at)}</div>
              </div>
            </li>
          )
        })}
        {events.length === 0 && (
          <li className="text-sm text-navy-500">No activity yet.</li>
        )}
      </ol>
    </div>
  )
}
