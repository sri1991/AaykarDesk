// In-memory + localStorage demo store. Used when Supabase env vars are absent
// so the app is fully usable for demos and reviews without any backend.
import { randomToken } from './utils.js'

const KEY = 'aaykardesk_demo_v1'

function seed() {
  const today = new Date()
  const offset = (days) => {
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const cases = [
    {
      id: 'c-1001',
      case_number: 'AD-2026-0001',
      client_name: 'Sundaram Textiles Pvt Ltd',
      client_pan: 'AABCS1234F',
      client_email: 'cfo@sundaramtex.in',
      client_phone: '919812345678',
      assessment_year: '2022-23',
      notice_section: '143(2)',
      notice_type: 'scrutiny',
      ao_name: 'Shri R. Krishnan',
      ward_circle: 'Circle 3(1)(1)',
      jurisdiction: 'Chennai',
      deadline: offset(3),
      deadline_type: 'statutory',
      status: 'awaiting_documents',
      priority: 'critical',
      created_at: offset(-12),
    },
    {
      id: 'c-1002',
      case_number: 'AD-2026-0002',
      client_name: 'Meera Iyer',
      client_pan: 'AKLPI2345K',
      client_email: 'meera.iyer@example.com',
      client_phone: '919900112233',
      assessment_year: '2023-24',
      notice_section: '142(1)',
      notice_type: 'scrutiny',
      ao_name: 'Smt P. Lakshmi',
      ward_circle: 'Ward 12(3)',
      jurisdiction: 'Bengaluru',
      deadline: offset(10),
      deadline_type: 'statutory',
      status: 'documents_received',
      priority: 'high',
      created_at: offset(-9),
    },
    {
      id: 'c-1003',
      case_number: 'AD-2026-0003',
      client_name: 'Rajesh Kumar Saraf (HUF)',
      client_pan: 'AAAHR9821B',
      client_email: 'rajesh.saraf@example.com',
      client_phone: '919811223344',
      assessment_year: '2021-22',
      notice_section: '148A',
      notice_type: 'reassessment',
      ao_name: 'Shri A. Mehta',
      ward_circle: 'Range 42',
      jurisdiction: 'Mumbai',
      deadline: offset(20),
      deadline_type: 'statutory',
      status: 'triage_complete',
      priority: 'high',
      created_at: offset(-25),
    },
    {
      id: 'c-1004',
      case_number: 'AD-2026-0004',
      client_name: 'Greenleaf Organics LLP',
      client_pan: 'AAGFG7788L',
      client_email: 'accounts@greenleaf.in',
      client_phone: '919876512345',
      assessment_year: '2023-24',
      notice_section: '143(2)',
      notice_type: 'scrutiny',
      ao_name: 'Shri V. Naidu',
      ward_circle: 'Circle 5(2)',
      jurisdiction: 'Hyderabad',
      deadline: offset(-2),
      deadline_type: 'statutory',
      status: 'draft_ready',
      priority: 'critical',
      created_at: offset(-18),
    },
    {
      id: 'c-1005',
      case_number: 'AD-2026-0005',
      client_name: 'Anita Bhargava',
      client_pan: 'AHGPB7766C',
      client_email: 'anita.b@example.com',
      client_phone: '919812000000',
      assessment_year: '2024-25',
      notice_section: '139(9)',
      notice_type: 'rectification',
      ao_name: 'Shri S. Roy',
      ward_circle: 'Ward 4(1)',
      jurisdiction: 'Kolkata',
      deadline: offset(28),
      deadline_type: 'statutory',
      status: 'new',
      priority: 'medium',
      created_at: offset(-2),
    },
    {
      id: 'c-1006',
      case_number: 'AD-2026-0006',
      client_name: 'Pranav Sethi',
      client_pan: 'BNZPS5544Q',
      client_email: 'pranav@example.com',
      client_phone: '919898765432',
      assessment_year: '2022-23',
      notice_section: '271(1)(c)',
      notice_type: 'penalty',
      ao_name: 'Shri D. Khurana',
      ward_circle: 'Range 19',
      jurisdiction: 'Delhi',
      deadline: offset(45),
      deadline_type: 'statutory',
      status: 'response_filed',
      priority: 'low',
      created_at: offset(-40),
    },
  ]

  const checklists = {
    'c-1001': [
      { id: 'i1', case_id: 'c-1001', document_name: 'ITR-V for AY 2022-23', is_mandatory: true, status: 'uploaded' },
      { id: 'i2', case_id: 'c-1001', document_name: 'Audited financials FY 2021-22', is_mandatory: true, status: 'pending' },
      { id: 'i3', case_id: 'c-1001', document_name: 'Bank statement — HDFC Current A/c', is_mandatory: true, status: 'pending' },
      { id: 'i4', case_id: 'c-1001', document_name: 'GSTR-1 / GSTR-3B reconciliations', is_mandatory: true, status: 'pending' },
      { id: 'i5', case_id: 'c-1001', document_name: 'Sundry creditors confirmation letters', is_mandatory: false, status: 'pending' },
    ],
    'c-1002': [
      { id: 'j1', case_id: 'c-1002', document_name: 'Form 26AS', is_mandatory: true, status: 'verified' },
      { id: 'j2', case_id: 'c-1002', document_name: 'Capital gains computation', is_mandatory: true, status: 'verified' },
      { id: 'j3', case_id: 'c-1002', document_name: 'Demat statement', is_mandatory: true, status: 'uploaded' },
    ],
    'c-1003': [
      { id: 'k1', case_id: 'c-1003', document_name: 'Source of funds — property purchase', is_mandatory: true, status: 'verified' },
      { id: 'k2', case_id: 'c-1003', document_name: 'Sale deed', is_mandatory: true, status: 'verified' },
      { id: 'k3', case_id: 'c-1003', document_name: 'Bank statement — last 24 months', is_mandatory: true, status: 'verified' },
    ],
    'c-1004': [
      { id: 'l1', case_id: 'c-1004', document_name: 'Audited B/S and P&L', is_mandatory: true, status: 'verified' },
      { id: 'l2', case_id: 'c-1004', document_name: 'Partner capital accounts', is_mandatory: true, status: 'verified' },
    ],
    'c-1005': [
      { id: 'm1', case_id: 'c-1005', document_name: 'Original ITR acknowledgement', is_mandatory: true, status: 'pending' },
      { id: 'm2', case_id: 'c-1005', document_name: 'Form 16', is_mandatory: true, status: 'pending' },
    ],
    'c-1006': [
      { id: 'n1', case_id: 'c-1006', document_name: 'Penalty order copy', is_mandatory: true, status: 'verified' },
      { id: 'n2', case_id: 'c-1006', document_name: 'Submissions filed before AO', is_mandatory: true, status: 'verified' },
    ],
  }

  const magicLinks = {
    'c-1001': { id: 'ml-1001', case_id: 'c-1001', token: randomToken(32), is_active: true, created_at: offset(-10), accessed_at: offset(-3) },
    'c-1002': { id: 'ml-1002', case_id: 'c-1002', token: randomToken(32), is_active: true, created_at: offset(-8), accessed_at: offset(-1) },
    'c-1005': { id: 'ml-1005', case_id: 'c-1005', token: randomToken(32), is_active: true, created_at: offset(-1), accessed_at: null },
  }

  const triage = {
    'c-1003': {
      case_id: 'c-1003',
      status: 'complete',
      risk_assessment: 'medium',
      summary:
        'Reassessment u/s 148A based on alleged unexplained credit of ₹42L from sale of immovable property. Source of funds and sale deed corroborate the transaction. Indexation benefit appears correctly claimed. Recommend filing detailed reply within 21 days with supporting bank trail.',
      discrepancies: [
        { title: 'Cash deposit pattern in Mar 2022', severity: 'medium', detail: 'Three deposits aggregating ₹6.8L lack contemporaneous narration.' },
        { title: 'Property valuation', severity: 'low', detail: 'Stamp duty value matches consideration; no s.50C adjustment expected.' },
      ],
      section_mapping: [
        { act_1961: '148A(b)', act_2025: '149', note: 'Show-cause prior to reopening — analogue retained' },
        { act_1961: '147', act_2025: '148', note: 'Reassessment trigger — new act renumbers' },
      ],
      created_at: offset(-1),
    },
    'c-1004': {
      case_id: 'c-1004',
      status: 'complete',
      risk_assessment: 'high',
      summary:
        'Scrutiny u/s 143(2) raises 4 specific queries on partner remuneration deductibility, GP ratio variance, related party transactions and loan creditors. Draft response prepared. Critical: deadline overdue — request adjournment immediately.',
      discrepancies: [
        { title: 'Partner remuneration cap', severity: 'high', detail: 'Working u/s 40(b) crosses statutory limit by ₹3.1L — disallowance probable.' },
        { title: 'GP ratio fall', severity: 'medium', detail: 'GP fell from 18.4% to 12.1% YoY; needs explanation with cost build-up.' },
      ],
      section_mapping: [
        { act_1961: '40(b)', act_2025: '36', note: 'Partner remuneration cap retained with revised limits' },
      ],
      created_at: offset(-1),
    },
  }

  return { cases, checklists, magicLinks, triage, uploads: {} }
}

function load() {
  if (typeof localStorage === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const fresh = seed()
      localStorage.setItem(KEY, JSON.stringify(fresh))
      return fresh
    }
    return JSON.parse(raw)
  } catch {
    return seed()
  }
}

function save(state) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(state))
}

let state = load()
const subscribers = new Set()

function notify() {
  save(state)
  subscribers.forEach((fn) => fn(state))
}

export const demoStore = {
  subscribe(fn) {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  },
  getState() {
    return state
  },
  listCases() {
    return [...state.cases].sort((a, b) => {
      const ad = a.deadline ? new Date(a.deadline).getTime() : Infinity
      const bd = b.deadline ? new Date(b.deadline).getTime() : Infinity
      return ad - bd
    })
  },
  getCase(id) {
    return state.cases.find((c) => c.id === id) || null
  },
  getCaseByToken(token) {
    const link = Object.values(state.magicLinks).find((m) => m.token === token)
    if (!link) return null
    const c = state.cases.find((c) => c.id === link.case_id)
    return c ? { case: c, magicLink: link } : null
  },
  getChecklist(caseId) {
    return state.checklists[caseId] || []
  },
  getMagicLink(caseId) {
    return state.magicLinks[caseId] || null
  },
  getTriage(caseId) {
    return state.triage[caseId] || null
  },
  getUploads(caseId) {
    return state.uploads[caseId] || []
  },
  reset() {
    state = seed()
    notify()
  },
  createCase(input) {
    const seq = state.cases.length + 1
    const id = `c-${1000 + seq + 6}`
    const now = new Date().toISOString()
    const newCase = {
      id,
      case_number: input.case_number || `AD-2026-${String(seq).padStart(4, '0')}`,
      client_name: input.client_name,
      client_pan: input.client_pan || null,
      client_email: input.client_email || null,
      client_phone: input.client_phone || null,
      assessment_year: input.assessment_year,
      notice_section: input.notice_section || null,
      notice_type: input.notice_type || null,
      ao_name: input.ao_name || null,
      ward_circle: input.ward_circle || null,
      jurisdiction: input.jurisdiction || null,
      deadline: input.deadline || null,
      deadline_type: input.deadline_type || 'statutory',
      status: 'awaiting_documents',
      priority: input.priority || 'medium',
      notes: input.notes || null,
      created_at: now,
    }
    state.cases.unshift(newCase)
    state.checklists[id] = (input.documents_requested || []).map((d, i) => ({
      id: `ck-${id}-${i}`,
      case_id: id,
      document_name: d.name,
      description: d.description || null,
      is_mandatory: d.is_mandatory !== false,
      status: 'pending',
      sort_order: i,
    }))
    state.magicLinks[id] = {
      id: `ml-${id}`,
      case_id: id,
      token: randomToken(32),
      is_active: true,
      created_at: now,
      accessed_at: null,
    }
    notify()
    return newCase
  },
  updateChecklistItem(itemId, patch) {
    for (const caseId of Object.keys(state.checklists)) {
      const list = state.checklists[caseId]
      const idx = list.findIndex((i) => i.id === itemId)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch }
        notify()
        return list[idx]
      }
    }
    return null
  },
  addUpload(caseId, upload) {
    if (!state.uploads[caseId]) state.uploads[caseId] = []
    const rec = { id: `u-${Date.now()}`, uploaded_at: new Date().toISOString(), ...upload }
    state.uploads[caseId].unshift(rec)
    notify()
    return rec
  },
  setTriage(caseId, payload) {
    state.triage[caseId] = { case_id: caseId, status: 'complete', created_at: new Date().toISOString(), ...payload }
    const c = state.cases.find((c) => c.id === caseId)
    if (c) c.status = 'triage_complete'
    notify()
    return state.triage[caseId]
  },
  rotateMagicLink(caseId) {
    const existing = state.magicLinks[caseId]
    const now = new Date().toISOString()
    state.magicLinks[caseId] = {
      id: existing?.id || `ml-${caseId}`,
      case_id: caseId,
      token: randomToken(32),
      is_active: true,
      created_at: now,
      accessed_at: null,
    }
    notify()
    return state.magicLinks[caseId]
  },
}
