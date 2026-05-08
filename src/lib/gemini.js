const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const FLASH_MODEL = 'gemini-1.5-flash-latest'
const PRO_MODEL = 'gemini-1.5-pro-latest'

export const EXTRACTION_PROMPT = `You are a tax notice extraction engine for Indian income tax notices.
Extract the following fields from the uploaded notice PDF. Return ONLY valid JSON.

{
  "notice_section": "string — the section under which notice is issued (e.g., 142(1), 143(2), 148, 148A, 263)",
  "notice_type": "string — scrutiny | reassessment | demand | penalty | rectification",
  "assessment_year": "string — the AY mentioned (e.g., 2024-25)",
  "client_name": "string — name of the assessee",
  "client_pan": "string — PAN of the assessee",
  "ao_name": "string — name of the Assessing Officer if mentioned",
  "ward_circle": "string — ward/circle/range mentioned",
  "jurisdiction": "string — city/region of the AO",
  "issue_date": "string — date of issue (ISO format YYYY-MM-DD)",
  "compliance_date": "string — date by which response is due (ISO format YYYY-MM-DD)",
  "deadline_type": "string — statutory | hearing_date | adjournment",
  "key_issues": ["array of strings — main issues/queries raised in the notice"],
  "documents_requested": [
    { "name": "string", "description": "string", "is_mandatory": true }
  ],
  "amount_involved": "number or null",
  "act_references": ["array — sections of IT Act referenced"],
  "confidence": { "overall": 0.0-1.0, "deadline": 0.0-1.0, "section": 0.0-1.0 }
}

IMPORTANT:
- If a field cannot be determined, set it to null
- For deadline: compute from compliance date; if "within N days" stated, compute from issue_date
- For documents_requested: extract EVERY document mentioned in annexure or body
- For act_references: capture both 1961 Act and 2025 Act sections if present
- Return ONLY the JSON object, no markdown, no explanation`

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
