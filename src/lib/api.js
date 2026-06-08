// Unified data layer. Delegates to Supabase when configured, otherwise to the
// in-browser demo store — so the app behaves identically in both modes and the
// UI never has to know which backend is in use.
import { supabase, isSupabaseConfigured, STORAGE_BUCKETS } from './supabase.js'
import { demoStore } from './demoStore.js'

// Make a storage-safe object key from a user-supplied file name.
function safeName(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

// Generate a short-lived signed URL for a private storage object.
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!isSupabaseConfigured || !path) return null
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  return data?.signedUrl || null
}

// --- change notification --------------------------------------------------
// A single stream the hooks subscribe to so a write anywhere refreshes reads.
const subscribers = new Set()
export function subscribeData(fn) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}
function emit() {
  subscribers.forEach((fn) => fn())
}
// Bridge demo-store mutations into the same stream.
if (!isSupabaseConfigured) {
  demoStore.subscribe(() => emit())
}

// --- provisioning ----------------------------------------------------------
let cachedFirmId = null
export async function ensureProvisioned() {
  if (!isSupabaseConfigured) return null
  if (cachedFirmId) return cachedFirmId
  const { data, error } = await supabase.rpc('ensure_user_provisioned')
  if (error) throw error
  cachedFirmId = data
  return data
}
export function resetProvisioning() {
  cachedFirmId = null
}

// --- reads -----------------------------------------------------------------
export async function listCases() {
  if (!isSupabaseConfigured) return demoStore.listCases()
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data || []
}

function demoBundle(id) {
  return {
    case: demoStore.getCase(id),
    checklist: demoStore.getChecklist(id),
    magicLink: demoStore.getMagicLink(id),
    triage: demoStore.getTriage(id),
    uploads: demoStore.getUploads(id),
    referenceGuidance: demoStore.getReferenceGuidance(id),
    clientFinancials: demoStore.getClientFinancials(id),
    notice: null,
  }
}

export async function getCaseBundle(id) {
  if (!isSupabaseConfigured) return demoBundle(id)

  const [caseRes, checklistRes, linksRes, triageRes, finRes, extrRes, noticeRes] = await Promise.all([
    supabase.from('cases').select('*').eq('id', id).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('case_id', id).order('sort_order', { ascending: true }),
    supabase.from('magic_links').select('*').eq('case_id', id).order('created_at', { ascending: false }),
    supabase.from('triage_results').select('*').eq('case_id', id).order('created_at', { ascending: false }).limit(1),
    supabase.from('client_financial_data').select('*').eq('case_id', id),
    supabase
      .from('extractions')
      .select('*')
      .eq('case_id', id)
      .eq('extraction_type', 'notice_fields')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('notices').select('*').eq('case_id', id).order('created_at', { ascending: false }).limit(1),
  ])

  const links = linksRes.data || []
  const magicLink = links.find((l) => l.is_active) || links[0] || null

  let uploads = []
  if (links.length) {
    const { data } = await supabase
      .from('client_uploads')
      .select('*')
      .in('magic_link_id', links.map((l) => l.id))
      .order('uploaded_at', { ascending: false })
    uploads = data || []
  }

  const extraction = (extrRes.data && extrRes.data[0]) || null
  const referenceGuidance = extraction
    ? {
        ...(extraction.reference_guidance || {}),
        act_references:
          extraction.result?.act_references ||
          extraction.reference_guidance?.act_references ||
          [],
      }
    : null

  return {
    case: caseRes.data || null,
    checklist: checklistRes.data || [],
    magicLink,
    triage: (triageRes.data && triageRes.data[0]) || null,
    uploads,
    referenceGuidance,
    clientFinancials: finRes.data || [],
    notice: (noticeRes.data && noticeRes.data[0]) || null,
  }
}

export async function getCaseByToken(token) {
  if (!isSupabaseConfigured) {
    const found = demoStore.getCaseByToken(token)
    if (!found) return null
    return {
      ...found,
      checklist: demoStore.getChecklist(found.case.id),
      uploads: demoStore.getUploads(found.case.id),
    }
  }
  const { data, error } = await supabase.rpc('get_case_by_token', { p_token: token })
  if (error || !data) return null
  return data
}

// --- writes ----------------------------------------------------------------
const CASE_COLUMNS = [
  'client_name', 'client_pan', 'client_email', 'client_phone', 'assessment_year',
  'notice_section', 'notice_type', 'ao_name', 'ward_circle', 'jurisdiction',
  'deadline', 'deadline_type', 'priority', 'notes', 'is_faceless',
  'assessment_regime', 'tally_company_name', 'tally_import_status',
]

export async function createCase(input, file) {
  if (!isSupabaseConfigured) return demoStore.createCase(input)

  const firmId = await ensureProvisioned()
  const row = { firm_id: firmId, status: 'awaiting_documents', priority: input.priority || 'medium' }
  for (const col of CASE_COLUMNS) {
    if (input[col] !== undefined && input[col] !== '') row[col] = input[col]
  }
  row.is_faceless =
    input.is_faceless ?? (input.assessment_regime ? input.assessment_regime === 'faceless' : true)
  row.assessment_regime =
    input.assessment_regime || (input.is_faceless === false ? 'jurisdictional' : 'faceless')
  row.case_number = `AD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  const { data: created, error } = await supabase.from('cases').insert(row).select().single()
  if (error) throw error

  const docs = input.documents_requested || []
  if (docs.length) {
    const items = docs.map((d, i) => ({
      case_id: created.id,
      document_name: d.name,
      description: d.description || null,
      is_mandatory: d.is_mandatory !== false,
      tally_exportable: d.tally_exportable === true,
      suggested_source: d.suggested_source || null,
      status: 'pending',
      sort_order: i,
    }))
    const { error: e } = await supabase.from('checklist_items').insert(items)
    if (e) throw e
  }

  // Persist the extraction (fields + reference guidance) for the case tabs.
  await supabase.from('extractions').insert({
    case_id: created.id,
    extraction_type: 'notice_fields',
    model_used: import.meta.env.VITE_GEMINI_API_KEY ? 'gemini-2.5-flash' : 'sample',
    result: input,
    reference_guidance: input.reference_guidance || null,
    confidence: input.confidence?.overall ?? null,
  })

  // Create the initial client magic link (token/expiry come from DB defaults).
  await supabase.from('magic_links').insert({ case_id: created.id })

  // Upload the notice PDF to private storage (best-effort — a missing bucket or
  // storage policy should not block case creation).
  if (file) {
    try {
      const path = `${created.id}/${Date.now()}-${safeName(file.name)}`
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKETS.notices)
        .upload(path, file, { contentType: file.type, upsert: false })
      if (!upErr) {
        await supabase.from('notices').insert({
          case_id: created.id,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
        })
      }
    } catch {
      /* notice file is optional; ignore upload failures */
    }
  }

  emit()
  return created
}

export async function rotateMagicLink(caseId) {
  if (!isSupabaseConfigured) return demoStore.rotateMagicLink(caseId)
  await supabase.from('magic_links').update({ is_active: false }).eq('case_id', caseId)
  const { data, error } = await supabase
    .from('magic_links')
    .insert({ case_id: caseId })
    .select()
    .single()
  if (error) throw error
  emit()
  return data
}

export async function setTriage(caseId, payload) {
  if (!isSupabaseConfigured) return demoStore.setTriage(caseId, payload)
  const { error } = await supabase.from('triage_results').insert({
    case_id: caseId,
    status: 'complete',
    risk_assessment: payload.risk_assessment || null,
    summary: payload.summary || null,
    discrepancies: payload.discrepancies || null,
    section_mapping: payload.section_mapping || null,
    draft_response: payload.draft_response || null,
  })
  if (error) throw error
  await supabase.from('cases').update({ status: 'triage_complete' }).eq('id', caseId)
  emit()
}

// --- client portal writes (token-scoped via RPC when on Supabase) ----------
export async function portalUploadDocument(token, caseId, item, file) {
  if (!isSupabaseConfigured) {
    demoStore.updateChecklistItem(item.id, { status: 'uploaded' })
    demoStore.addUpload(caseId, {
      checklist_item_id: item.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    })
    return
  }
  const path = `${token}/${item.id}/${Date.now()}-${safeName(file.name)}`
  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.clientUploads)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) throw upErr

  const { error } = await supabase.rpc('portal_upload_document', {
    p_token: token,
    p_item_id: item.id,
    p_file_path: path,
    p_file_name: file.name,
    p_file_size: file.size,
    p_file_type: file.type,
  })
  if (error) throw error
  emit()
}

export async function portalRemoveDocument(token, item) {
  if (!isSupabaseConfigured) {
    demoStore.updateChecklistItem(item.id, { status: 'pending' })
    return
  }
  const { error } = await supabase.rpc('portal_remove_document', {
    p_token: token,
    p_item_id: item.id,
  })
  if (error) throw error
  emit()
}
