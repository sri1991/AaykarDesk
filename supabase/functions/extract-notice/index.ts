// Supabase Edge Function: extract notice fields from a PDF using Gemini 1.5 Flash.
// Deploy: `supabase functions deploy extract-notice`
// Body: { case_id: string, file_path: string }
// Reads the file from storage, sends to Gemini, persists raw_extraction on notices,
// and creates checklist_items rows from documents_requested.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXTRACTION_PROMPT = `You are a tax notice extraction engine for Indian income tax notices.
Extract these fields and return ONLY valid JSON:
{
  "notice_section": "string", "notice_type": "string", "assessment_year": "string",
  "client_name": "string", "client_pan": "string", "ao_name": "string",
  "ward_circle": "string", "jurisdiction": "string",
  "issue_date": "YYYY-MM-DD", "compliance_date": "YYYY-MM-DD",
  "deadline_type": "statutory|hearing_date|adjournment",
  "key_issues": [],
  "documents_requested": [{ "name": "", "description": "", "is_mandatory": true }],
  "amount_involved": null, "act_references": [],
  "confidence": { "overall": 0.0, "deadline": 0.0, "section": 0.0 }
}`

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { case_id, file_path } = await req.json()

  if (!case_id || !file_path) {
    return new Response(JSON.stringify({ error: 'case_id and file_path required' }), { status: 400 })
  }

  const { data: file, error: dlError } = await supabase.storage
    .from('notices')
    .download(file_path)
  if (dlError || !file) {
    return new Response(JSON.stringify({ error: dlError?.message || 'download failed' }), { status: 500 })
  }
  const buf = new Uint8Array(await file.arrayBuffer())
  const base64 = btoa(String.fromCharCode(...buf))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`
  const start = performance.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: EXTRACTION_PROMPT },
            { inline_data: { mime_type: 'application/pdf', data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, response_mime_type: 'application/json' },
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

  await supabase
    .from('notices')
    .update({ raw_extraction: parsed })
    .eq('case_id', case_id)
    .eq('file_path', file_path)

  await supabase.from('extractions').insert({
    case_id,
    extraction_type: 'notice_fields',
    model_used: 'gemini-1.5-flash-latest',
    result: parsed,
    confidence: parsed?.confidence?.overall ?? null,
    processing_time_ms: elapsed,
  })

  if (Array.isArray(parsed.documents_requested) && parsed.documents_requested.length > 0) {
    await supabase.from('checklist_items').insert(
      parsed.documents_requested.map((d: any, i: number) => ({
        case_id,
        document_name: d.name,
        description: d.description ?? null,
        is_mandatory: d.is_mandatory !== false,
        sort_order: i,
      })),
    )
  }

  return new Response(JSON.stringify({ ok: true, extraction: parsed, processing_ms: elapsed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
