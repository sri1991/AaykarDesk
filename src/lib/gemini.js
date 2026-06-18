const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const FLASH_MODEL = 'gemini-2.5-flash'
const PRO_MODEL = 'gemini-2.5-pro'

export const EXTRACTION_PROMPT = `SYSTEM: You are a tax notice extraction engine for Indian income tax notices.
You understand both the Income Tax Act 1961 (repealed) and the Income Tax Act 2025.
Extract the following fields from the uploaded notice PDF. Return ONLY valid JSON.

{
  "notice_section": "string — section under which notice is issued",
  "notice_type": "string — scrutiny | reassessment | demand | penalty | rectification | best_judgment",
  "assessment_year": "string — the AY mentioned (e.g., 2024-25)",
  "client_name": "string — name of the assessee",
  "client_pan": "string — PAN of the assessee",
  "ao_name": "string — name of the Assessing Officer if mentioned, or 'Faceless - NaFAC' if faceless",
  "ward_circle": "string — ward/circle/range, or 'National e-Assessment Centre' if faceless",
  "jurisdiction": "string — city/region",
  "is_faceless": "boolean — true if issued under Faceless Assessment Scheme",
  "assessment_regime": "string — faceless | jurisdictional | transfer_pricing | search_case",
  "issue_date": "string — ISO format YYYY-MM-DD",
  "compliance_date": "string — ISO format YYYY-MM-DD",
  "deadline_type": "string — statutory | hearing_date | adjournment",
  "key_issues": ["array of strings — main issues/queries raised"],
  "documents_requested": [
    {
      "name": "string — document name as stated",
      "description": "string — specifics (period, account, etc.)",
      "is_mandatory": true,
      "tally_exportable": true,
      "suggested_source": "string — 'tally' | 'bank' | 'employer' | 'client_records' | 'government_portal'"
    }
  ],
  "amount_involved": "number or null",
  "client_notice_summary": "string — a warm, calm, factual plain-language explanation of this notice for the CLIENT (4-6 sentences, 300-500 chars). Cover: what the notice is, why the IT department issued it, what the client must do (submit documents to the CA, who handles the response), and reassurance that the CA is managing the process. No section references, no jargon, no mention of penalties/prosecution/worst-case outcomes, no legal advice or speculation about outcomes. Leave as an empty string if the notice section is not one of 143(1), 143(2), 245, 139(9).",
  "act_references": [
    {
      "section_cited": "string — exact section cited in notice",
      "act_version": "string — '1961' or '2025'",
      "equivalent_section": "string — mapped section in the other Act version",
      "topic": "string — brief description of what this section covers"
    }
  ],
  "reference_guidance": {
    "response_format": "string — 'e_proceeding_portal' | 'physical_submission' | 'email'",
    "requires_dsc": true,
    "faceless_procedure_notes": "string — any specific faceless procedure requirements",
    "relevant_rules": ["array — applicable Income Tax Rules"],
    "taxmann_search_query": "string — pre-built search query for Taxmann.AI research"
  },
  "confidence": {
    "overall": 0.0,
    "deadline": 0.0,
    "section": 0.0,
    "faceless_detection": 0.0
  }
}

IMPORTANT:
- Detect whether this is a Faceless Assessment notice (issued by NaFAC/National Faceless Assessment Centre)
- For each document requested, indicate if it can be exported from TallyPrime
- For act_references, always provide the equivalent section in the other Act version (1961↔2025)
- Generate a taxmann_search_query that would help a CA find relevant case law for the main issues
- Return ONLY the JSON object`

export const TRIAGE_PROMPT = `You are an expert Indian income tax practitioner triaging a scrutiny case.
Given the notice metadata and a list of uploaded documents, produce a structured briefing.
Return ONLY valid JSON of shape:
{
  "discrepancies": [{ "title": "string", "severity": "high|medium|low", "detail": "string" }],
  "section_mapping": [{ "act_1961": "string", "act_2025": "string", "note": "string" }],
  "risk_assessment": "high|medium|low",
  "summary": "string — 4-6 sentence executive summary for the CA",
  "draft_response": "string — short template draft of compliance response"
}`

// Notice types the client summary may be auto-generated for. Anything else is
// left blank for the CA to write manually (Enhancement 5, limited rollout).
export const NOTICE_SUMMARY_WHITELIST = ['143(1)', '143(2)', '245', '139(9)']

export function isSummaryWhitelisted(section) {
  if (!section) return false
  const s = String(section).trim()
  return NOTICE_SUMMARY_WHITELIST.some((w) => s === w || s.startsWith(w))
}

export const NOTICE_SUMMARY_PROMPT = `You write plain-language explanations of Indian income tax notices for the
taxpayer (the CA's client). Given the notice metadata, produce a single summary
paragraph of 4-6 sentences (aim for 300-500 characters).

Cover, in order:
1. What the notice is, in plain words.
2. Why the Income Tax Department issued it.
3. What the client needs to do — submit the requested documents to their CA, who handles the response.
4. Reassurance that the CA is managing the process.

Tone: warm, calm, factual. Constraints: no section numbers, no jargon, no legal
advice, no speculation about outcomes, and never mention penalties, prosecution,
or worst-case scenarios. Return ONLY the summary text (no JSON, no headings).`

export async function generateNoticeSummary(context, { apiKey } = {}) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY')

  const url = `${API_BASE}/${FLASH_MODEL}:generateContent?key=${key}`
  const body = {
    contents: [
      {
        parts: [
          { text: NOTICE_SUMMARY_PROMPT },
          { text: `\nNotice metadata:\n${JSON.stringify(context, null, 2)}` },
        ],
      },
    ],
    generationConfig: { temperature: 0.4 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini summary failed: ${res.status} ${errText}`)
  }
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return text.trim()
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function stripJsonFences(text) {
  if (!text) return text
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

export async function extractNoticeFromPdf(file, { apiKey } = {}) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY')

  const data = await fileToBase64(file)
  const url = `${API_BASE}/${FLASH_MODEL}:generateContent?key=${key}`
  const body = {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          { inline_data: { mime_type: file.type || 'application/pdf', data } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, response_mime_type: 'application/json' },
  }

  const start = performance.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini extraction failed: ${res.status} ${errText}`)
  }
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const parsed = JSON.parse(stripJsonFences(text))
  return {
    result: parsed,
    raw: json,
    model: FLASH_MODEL,
    processingMs: Math.round(performance.now() - start),
  }
}

export async function triageCase(context, { apiKey } = {}) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY')

  const url = `${API_BASE}/${PRO_MODEL}:generateContent?key=${key}`
  const body = {
    contents: [
      {
        parts: [
          { text: TRIAGE_PROMPT },
          { text: `\nCase Context:\n${JSON.stringify(context, null, 2)}` },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, response_mime_type: 'application/json' },
  }

  const start = performance.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini triage failed: ${res.status} ${errText}`)
  }
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const parsed = JSON.parse(stripJsonFences(text))
  return {
    result: parsed,
    raw: json,
    model: PRO_MODEL,
    processingMs: Math.round(performance.now() - start),
  }
}
