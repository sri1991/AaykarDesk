export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value, opts = {}) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function daysUntil(dateLike) {
  if (!dateLike) return null
  const target = new Date(dateLike)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function deadlineSeverity(dateLike) {
  const days = daysUntil(dateLike)
  if (days === null) return { level: 'none', days: null }
  if (days < 0) return { level: 'overdue', days }
  if (days <= 7) return { level: 'high', days }
  if (days <= 15) return { level: 'medium', days }
  return { level: 'low', days }
}

// --- deadline urgency escalation (client portal, Enhancement 4) -------------
// Days remaining are computed against "today" in IST so the escalation matches
// the compliance clock regardless of the viewer's timezone.
function parseDateOnly(dateLike) {
  if (!dateLike) return null
  if (dateLike instanceof Date) {
    return Number.isNaN(dateLike.getTime())
      ? null
      : new Date(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate())
  }
  const s = String(dateLike)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function istToday() {
  const now = new Date()
  // Shift the UTC instant to the IST wall clock (UTC+5:30), then drop the time.
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000)
  return new Date(ist.getFullYear(), ist.getMonth(), ist.getDate())
}

export function daysRemainingIST(dateLike) {
  const target = parseDateOnly(dateLike)
  if (!target) return null
  return Math.round((target - istToday()) / 86400000)
}

// Returns { state, days } where state escalates as the deadline approaches.
export function deadlineUrgency(dateLike) {
  const days = daysRemainingIST(dateLike)
  if (days === null) return { state: 'none', days: null }
  if (days < 0) return { state: 'overdue', days }
  if (days === 0) return { state: 'today', days }
  if (days <= 2) return { state: 'critical', days }
  if (days <= 7) return { state: 'urgent', days }
  if (days <= 14) return { state: 'approaching', days }
  return { state: 'normal', days }
}

// --- file-type helpers (client portal, Enhancements 2 & 3) ------------------
export const DEFAULT_ACCEPTED_FILE_TYPES = ['pdf', 'jpg', 'png']

export const FILE_TYPE_META = {
  pdf: { ext: ['.pdf'], mime: ['application/pdf'], label: 'PDF' },
  jpg: { ext: ['.jpg', '.jpeg'], mime: ['image/jpeg'], label: 'JPG' },
  png: { ext: ['.png'], mime: ['image/png'], label: 'PNG' },
  heic: { ext: ['.heic'], mime: ['image/heic'], label: 'HEIC' },
  xlsx: {
    ext: ['.xlsx'],
    mime: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    label: 'XLSX',
  },
  csv: { ext: ['.csv'], mime: ['text/csv'], label: 'CSV' },
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'gif', 'webp'])

// Normalize a list of accepted-type tokens to canonical lowercase keys,
// falling back to the safe default when nothing usable is provided.
export function normalizeFileTypes(types) {
  if (!Array.isArray(types) || types.length === 0) return [...DEFAULT_ACCEPTED_FILE_TYPES]
  const norm = types
    .map((t) => String(t).toLowerCase().replace(/^\./, ''))
    .map((t) => (t === 'jpeg' ? 'jpg' : t))
    .filter(Boolean)
  return norm.length ? Array.from(new Set(norm)) : [...DEFAULT_ACCEPTED_FILE_TYPES]
}

// Human label for the "Accepts: …" hint, e.g. "PDF, JPG, PNG".
export function acceptedTypesLabel(types) {
  return normalizeFileTypes(types)
    .map((t) => FILE_TYPE_META[t]?.label || t.toUpperCase())
    .join(', ')
}

// Build the react-dropzone `accept` object: { mime: [".ext", …] }.
export function buildDropzoneAccept(types) {
  const accept = {}
  for (const t of normalizeFileTypes(types)) {
    const meta = FILE_TYPE_META[t]
    if (!meta) continue
    for (const m of meta.mime) {
      accept[m] = Array.from(new Set([...(accept[m] || []), ...meta.ext]))
    }
  }
  return accept
}

// Value for a native <input accept="…"> attribute, e.g. ".pdf,.jpg,.jpeg,.png".
export function acceptAttr(types) {
  const exts = normalizeFileTypes(types).flatMap((t) => FILE_TYPE_META[t]?.ext || [])
  return Array.from(new Set(exts)).join(',')
}

export function fileExtension(name) {
  if (!name || !name.includes('.')) return ''
  return name.split('.').pop().toLowerCase()
}

// True for image files (by MIME type or filename), used to decide thumbnail vs icon.
export function isImageFileType(nameOrType) {
  if (!nameOrType) return false
  const v = String(nameOrType).toLowerCase()
  if (v.startsWith('image/')) return true
  const ext = v.includes('/') ? '' : v.includes('.') ? v.split('.').pop() : v
  return IMAGE_EXTENSIONS.has(ext)
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return ''
  const b = Number(bytes)
  if (b < 1024) return `${b} B`
  const kb = b / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  const mb = kb / 1024
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

// Truncate a filename to ~max chars, keeping the extension visible.
export function truncateFilename(name, max = 40) {
  if (!name || name.length <= max) return name
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot) : ''
  const head = name.slice(0, Math.max(1, max - ext.length - 1))
  return `${head}…${ext}`
}

// Compact upload timestamp in local time, e.g. "18 Jun, 11:34 PM".
export function formatUploadTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

// CA-side sensible defaults for accepted file types, derived from the document
// name / suggested source. The CA can override in Stage C.
export function defaultAcceptedFileTypes(doc = {}) {
  const name = (doc.name || doc.document_name || '').toLowerCase()
  const source = doc.suggested_source || ''
  if (/reconcil|gstr|ledger|trial balance|computation|working/.test(name)) {
    return ['pdf', 'xlsx', 'csv']
  }
  if (source === 'tally') return ['pdf', 'xlsx', 'csv']
  if (/form\s*16|form\s*26as|26as|itr|intimation|notice|order/.test(name)) return ['pdf']
  if (source === 'government_portal' || source === 'employer' || source === 'bank') return ['pdf']
  if (/agreement|deed|invoice|receipt|photo|letter|confirmation/.test(name)) {
    return ['pdf', 'jpg', 'png']
  }
  return [...DEFAULT_ACCEPTED_FILE_TYPES]
}

export function isValidPan(pan) {
  if (!pan) return false
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())
}

export function generateCaseNumber(seq) {
  const year = new Date().getFullYear()
  return `AD-${year}-${String(seq || 1).padStart(4, '0')}`
}

export const STATUS_LABELS = {
  new: 'New',
  extraction_pending: 'Extracting',
  awaiting_documents: 'Awaiting Docs',
  documents_received: 'Docs Received',
  triage_pending: 'Triage Pending',
  triage_complete: 'Triage Complete',
  draft_ready: 'Draft Ready',
  response_filed: 'Filed',
  closed: 'Closed',
}

export const PRIORITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
  return Promise.resolve()
}

export function whatsappShareUrl(phone, text) {
  const cleaned = (phone || '').replace(/\D/g, '')
  const t = encodeURIComponent(text || '')
  return cleaned ? `https://wa.me/${cleaned}?text=${t}` : `https://wa.me/?text=${t}`
}

export function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}
