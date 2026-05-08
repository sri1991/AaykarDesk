// Supabase Edge Function: AI triage briefing using Gemini 1.5 Pro.
// Deploy: `supabase functions deploy triage-case`
// Body: { case_id: string }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TRIAGE_PROMPT = `You are an expert Indian income tax practitioner triaging a scrutiny case.
Given the notice metadata and uploaded documents, return ONLY JSON of shape:
{
  "discrepancies": [{ "title": "", "severity": "high|medium|low", "detail": "" }],
  "section_mapping": [{ "act_1961": "", "act_2025": "", "note": "" }],
  "risk_assessment": "high|medium|low",
  "summary": "",
  "draft_response": ""
}`

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  const { case_id } = await req.json()
  if (!case_id) return new Response(JSON.stringify({ error: 'case_id required' }), { status: 400 })

  const { data: caseRow } = await supabase.from('cases').select('*').eq('id', case_id).single()
  const { data: items } = await supabase.from('checklist_items').select('*').eq('case_id', case_id)
  const { data: notice } = await supabase
    .from('notices')
    .select('raw_extraction')
    .eq('case_id', case_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ctx = {
    case: caseRow,
    notice_extraction: notice?.raw_extraction ?? null,
    documents_uploaded: (items ?? []).filter((i) => ['uploaded', 'verified'].includes(i.status)).map((i) => i.document_name),
    documents_pending: (items ?? []).filter((i) => i.status === 'pending').map((i) => i.document_name),
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_KEY}`
  const start = performance.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: TRIAGE_PROMPT }, { text: `\nCase Context:\n${JSON.stringify(ctx, null, 2)}` }] }],
      generationConfig: { temperature: 0.2, response_mime_type: 'application/json' },
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    return new Response(JSON.stringify({ error: t }), { status: 500 })
  }
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const parsed = JSON.parse(text)
  const elapsed = Math.round(performance.now() - start)

  await supabase.from('triage_results').insert({
    case_id,
    discrepancies: parsed.discrepancies ?? [],
    section_mapping: parsed.section_mapping ?? [],
    risk_assessment: parsed.risk_assessment ?? null,
    summary: parsed.summary ?? null,
    draft_response: parsed.draft_response ?? null,
    status: 'complete',
  })
  await supabase.from('extractions').insert({
    case_id,
    extraction_type: 'triage',
    model_used: 'gemini-2.5-pro',
    result: parsed,
    processing_time_ms: elapsed,
  })
  await supabase.from('cases').update({ status: 'triage_complete' }).eq('id', case_id)

  return new Response(JSON.stringify({ ok: true, triage: parsed, processing_ms: elapsed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
