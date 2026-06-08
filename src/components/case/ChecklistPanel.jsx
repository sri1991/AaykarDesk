import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Database,
  Landmark,
  Briefcase,
  FolderOpen,
  Globe,
  Download,
  Eye,
} from 'lucide-react'
import { cx } from '../../lib/utils.js'
import { getSignedUrl } from '../../lib/api.js'
import { STORAGE_BUCKETS } from '../../lib/supabase.js'

const STATUS_META = {
  pending: { icon: Circle, label: 'Pending', cls: 'text-navy-400' },
  uploaded: { icon: Clock, label: 'Uploaded', cls: 'text-blue-700' },
  verified: { icon: CheckCircle2, label: 'Verified', cls: 'text-emerald-700' },
  rejected: { icon: AlertTriangle, label: 'Rejected', cls: 'text-red-700' },
}

const SOURCE_META = {
  tally: { icon: Database, label: 'Export from Tally', cls: 'text-amber-700' },
  bank: { icon: Landmark, label: 'Request from bank', cls: 'text-blue-700' },
  employer: { icon: Briefcase, label: 'Request from employer', cls: 'text-purple-700' },
  client_records: { icon: FolderOpen, label: 'From client files', cls: 'text-navy-600' },
  government_portal: { icon: Globe, label: 'Download from IT portal', cls: 'text-emerald-700' },
}

async function viewUpload(path) {
  const url = await getSignedUrl(STORAGE_BUCKETS.clientUploads, path)
  if (url) window.open(url, '_blank', 'noopener')
}

export default function ChecklistPanel({ items, uploads = [] }) {
  const total = items.length
  const done = items.filter((i) => i.status === 'verified' || i.status === 'uploaded').length
  const uploadByItem = new Map(uploads.map((u) => [u.checklist_item_id, u]))

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <h3 className="font-display text-base font-medium text-navy-900">
          Document checklist
        </h3>
        <span className="text-xs font-mono text-navy-600">
          {done}/{total}
        </span>
      </div>
      <div className="px-4 pt-3">
        <div className="h-1.5 w-full rounded bg-navy-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>
      <ul className="divide-y divide-navy-50 px-1 py-2">
        {items.map((item) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending
          const Icon = meta.icon
          const source = SOURCE_META[item.suggested_source]
          const SourceIcon = source?.icon
          const upload = uploadByItem.get(item.id)
          return (
            <li key={item.id} className="flex items-start gap-3 px-3 py-2.5">
              <Icon className={cx('h-4 w-4 mt-0.5 shrink-0', meta.cls)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy-900">
                  {item.document_name}
                  {!item.is_mandatory && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-navy-500">optional</span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-navy-500">{item.description}</div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {SourceIcon && (
                    <span className={cx('inline-flex items-center gap-1 text-[11px]', source.cls)}>
                      <SourceIcon className="h-3 w-3" />
                      {source.label}
                    </span>
                  )}
                  {item.tally_exportable && (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      <Database className="h-3 w-3" /> Available in Tally
                    </span>
                  )}
                  {item.tally_exportable && item.status === 'pending' && (
                    <button className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:underline">
                      <Download className="h-3 w-3" /> Upload from Tally
                    </button>
                  )}
                  {upload?.file_path && (
                    <button
                      onClick={() => viewUpload(upload.file_path)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline"
                    >
                      <Eye className="h-3 w-3" /> View {upload.file_name ? `(${upload.file_name})` : 'file'}
                    </button>
                  )}
                </div>
              </div>
              <span className={cx('text-xs font-medium shrink-0', meta.cls)}>{meta.label}</span>
            </li>
          )
        })}
        {items.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-navy-500">
            No checklist items.
          </li>
        )}
      </ul>
    </div>
  )
}
