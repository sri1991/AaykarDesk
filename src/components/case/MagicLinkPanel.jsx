import { useState } from 'react'
import { Link2, Copy, RefreshCw, MessageCircle, Check } from 'lucide-react'
import { copyToClipboard, formatDateTime, whatsappShareUrl } from '../../lib/utils.js'
import { rotateMagicLink } from '../../lib/api.js'

export default function MagicLinkPanel({ caseId, magicLink, clientName, clientPhone }) {
  const [copied, setCopied] = useState(false)
  const url = magicLink ? `${window.location.origin}/portal/${magicLink.token}` : ''

  const onCopy = async () => {
    await copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onRotate = () => {
    if (!confirm('Rotate the link? The previous URL will stop working.')) return
    rotateMagicLink(caseId)
  }

  const waText = `Hi${clientName ? ' ' + clientName.split(' ')[0] : ''}, please upload the requested documents here: ${url}`
  const waUrl = whatsappShareUrl(clientPhone, waText)

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <h3 className="font-display text-base font-medium text-navy-900">
          Client magic link
        </h3>
        <Link2 className="h-4 w-4 text-navy-500" />
      </div>
      <div className="p-4 space-y-3">
        {magicLink ? (
          <>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={url}
                className="input font-mono text-xs flex-1"
                onFocus={(e) => e.target.select()}
              />
              <button onClick={onCopy} className="btn-secondary px-3" title="Copy">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <MessageCircle className="h-4 w-4" />
                Share via WhatsApp
              </a>
              <button onClick={onRotate} className="btn-ghost">
                <RefreshCw className="h-3.5 w-3.5" />
                Rotate link
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-xs text-navy-600">
              <div>
                <dt className="label !mb-0">Created</dt>
                <dd>{formatDateTime(magicLink.created_at)}</dd>
              </div>
              <div>
                <dt className="label !mb-0">Last accessed</dt>
                <dd>{magicLink.accessed_at ? formatDateTime(magicLink.accessed_at) : 'Never'}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-navy-600">
            No active magic link.
            <button
              onClick={() => rotateMagicLink(caseId)}
              className="btn-primary ml-2"
            >
              Generate link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
