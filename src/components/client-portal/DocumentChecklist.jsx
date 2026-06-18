import { useEffect, useRef, useState } from 'react'
import FileUploader from './FileUploader.jsx'
import { portalUploadDocument, portalRemoveDocument } from '../../lib/api.js'
import { acceptedTypesLabel, isImageFileType } from '../../lib/utils.js'

function ItemBadge({ mandatory }) {
  if (mandatory) {
    return (
      <span className="shrink-0 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cream-50">
        Required
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full border border-navy-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy-500">
      If available
    </span>
  )
}

export default function DocumentChecklist({ items, caseId, token, uploads = [] }) {
  const [busy, setBusy] = useState({})
  // Object URLs for image previews of files the client just picked this session.
  const [previews, setPreviews] = useState({})
  const previewsRef = useRef({})
  previewsRef.current = previews

  const uploadByItem = new Map(uploads.map((u) => [u.checklist_item_id, u]))

  // Revoke any created object URLs when the component unmounts.
  useEffect(
    () => () => {
      Object.values(previewsRef.current).forEach((url) => url && URL.revokeObjectURL(url))
    },
    [],
  )

  const handleUpload = async (item, file) => {
    setBusy((b) => ({ ...b, [item.id]: true }))
    try {
      if (file) {
        if (isImageFileType(file.type || file.name)) {
          const url = URL.createObjectURL(file)
          setPreviews((p) => {
            if (p[item.id]) URL.revokeObjectURL(p[item.id])
            return { ...p, [item.id]: url }
          })
        }
        await portalUploadDocument(token, caseId, item, file)
      } else {
        setPreviews((p) => {
          if (p[item.id]) URL.revokeObjectURL(p[item.id])
          const { [item.id]: _drop, ...rest } = p
          return rest
        })
        await portalRemoveDocument(token, item)
      }
    } finally {
      setBusy((b) => ({ ...b, [item.id]: false }))
    }
  }

  return (
    <ul className="space-y-3">
      {items.map((item, idx) => {
        const mandatory = item.is_mandatory !== false
        const clientDescription = item.client_description || item.description
        const showReasoning = item.share_reasoning_with_client && item.internal_reasoning
        return (
          <li key={item.id} className="rounded-lg border border-navy-100 bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-navy-900">
                  <span className="text-navy-400 font-mono mr-2">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {item.document_name}
                </div>
                {clientDescription && (
                  <div className="text-xs text-navy-600 ml-7 mt-0.5">{clientDescription}</div>
                )}
                {showReasoning && (
                  <div className="ml-7 mt-1.5 rounded border border-navy-100 bg-cream-50 px-2.5 py-1.5 text-xs text-navy-600">
                    <span className="font-medium text-navy-700">Why this is needed: </span>
                    {item.internal_reasoning}
                  </div>
                )}
                <div className="ml-7 mt-1 text-[11px] text-navy-500">
                  Accepts: {acceptedTypesLabel(item.accepted_file_types)}
                </div>
              </div>
              <ItemBadge mandatory={mandatory} />
            </div>
            <FileUploader
              status={item.status}
              busy={busy[item.id]}
              acceptedFileTypes={item.accepted_file_types}
              upload={uploadByItem.get(item.id)}
              previewUrl={previews[item.id]}
              onFile={(f) => handleUpload(item, f)}
            />
          </li>
        )
      })}
    </ul>
  )
}
