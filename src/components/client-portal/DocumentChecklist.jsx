import { useState } from 'react'
import FileUploader from './FileUploader.jsx'
import { demoStore } from '../../lib/demoStore.js'

export default function DocumentChecklist({ items, caseId }) {
  const [busy, setBusy] = useState({})

  const handleUpload = async (item, file) => {
    setBusy((b) => ({ ...b, [item.id]: true }))
    try {
      if (file) {
        await new Promise((r) => setTimeout(r, 600))
        demoStore.updateChecklistItem(item.id, { status: 'uploaded' })
        demoStore.addUpload(caseId, {
          checklist_item_id: item.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        })
      } else {
        demoStore.updateChecklistItem(item.id, { status: 'pending' })
      }
    } finally {
      setBusy((b) => ({ ...b, [item.id]: false }))
    }
  }

  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={item.id} className="rounded-lg border border-navy-100 bg-white p-3 sm:p-4">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <div>
              <div className="text-sm font-medium text-navy-900">
                <span className="text-navy-400 font-mono mr-2">{String(idx + 1).padStart(2, '0')}</span>
                {item.document_name}
              </div>
              {item.description && (
                <div className="text-xs text-navy-600 ml-7">{item.description}</div>
              )}
            </div>
            {!item.is_mandatory && (
              <span className="text-[10px] uppercase tracking-wider text-navy-500">optional</span>
            )}
          </div>
          <FileUploader
            status={item.status}
            busy={busy[item.id]}
            onFile={(f) => handleUpload(item, f)}
          />
        </li>
      ))}
    </ul>
  )
}
