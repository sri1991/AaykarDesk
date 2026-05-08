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
