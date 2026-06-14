# AaykarDesk — Project Overview

> **From notice to response — without switching tabs.**

This document summarizes the business problem AaykarDesk solves and the state of the
current technical implementation. It is meant as a one/two-page brief for partners,
reviewers, and new contributors.

---

## 1. The Business Problem

When an Indian Chartered Accountant (CA) receives an income tax **scrutiny notice**
(e.g. under Section 143(2), 142(1), reassessment, penalty), responding to it is a
multi-hour, multi-tool grind:

1. **Log the notice** in a tracker (Jamku / ATOM Pro) and note the deadline.
2. **Read the notice** to identify the section, assessment year, AO, regime
   (Faceless/NaFAC vs. jurisdictional), and the exact documents the annexure demands.
3. **Pull the books** from TallyPrime for reconciliation.
4. **Research the law** in Taxmann.AI — including the awkward 1961 ↔ 2025 Act
   section cross-referencing now that the new Act is in play.
5. **Chase the client** over phone/WhatsApp for documents — and get back blurry
   photos and wrong files.
6. **Draft the response** in Word and upload it to the IT Portal e-Proceedings.

That's **five-plus tools, five-plus context switches, and 4–6 hours of pure admin**
per notice — with deadline tracking living in someone's head.

### The positioning

AaykarDesk is deliberately **not** a replacement for the tools a firm already trusts:

| Tool | Stays the system of record for |
| --- | --- |
| Jamku / ATOM Pro | Notice tracking & DSC management |
| TallyPrime | Books of accounts & reconciliation |
| Taxmann.AI | Legal research & case law |
| ClearTax / Saral | Return filing |

AaykarDesk is the **orchestration layer** that connects them into a single case
workflow and removes the manual glue between them.

### The workflow it delivers

**Upload notice PDF → AI extracts key fields → case is created → magic link shared
with client for document collection → AI triages the case for the CA.**

### Metrics that define success (tracked from day one)

- Notice upload → case creation time (target < 60s)
- Per-field extraction accuracy / confidence (incl. Faceless detection)
- Magic link open rate & document upload completion rate
- Magic-link-share → all-documents-received time
- Cases per firm per month

---

## 2. Current Technical Implementation

### Stack

- **Frontend:** React 18 + Vite + Tailwind 3 + React Router 6 (static SPA, deploys to Vercel)
- **Backend:** Supabase — Postgres, Auth, Storage, Edge Functions
- **AI:** Gemini 2.5 Flash (notice extraction) + Gemini 2.5 Pro (case triage)
- **Demo mode:** in-memory + `localStorage` store, so the app runs end-to-end with
  **no backend and no API keys** (six pre-seeded cases, including faceless,
  jurisdictional, and a Tally-imported reconciliation example)

### What works today

**Case lifecycle (UI complete)**
- `/cases` — dashboard with stats and a dense case table (status, priority, deadline indicators)
- `/cases/new` — upload → AI extract → review/confirm → create case
- `/cases/:id` — tabbed case detail
- `/portal/:token` — public, no-auth, mobile-friendly client document portal

**Case detail tabs**
- **Notice** — PDF + extracted fields, deadline banner, Faceless/Jurisdictional regime badge
- **Documents** — checklist with per-item source hints (Tally / bank / employer /
  portal / client) and the shareable magic link
- **Reconciliation** — side-by-side "As per Notice / 26AS" vs "As per Client Records"
  with mismatches highlighted
- **Research** — extracted act references with **1961 ↔ 2025 section mapping**
  and the relevant Income Tax Rules
- **Response** — *Phase 2 placeholder* (template draft, Word download, IT-Portal jump)

**AI extraction (live)**
- `src/lib/gemini.js` runs the extraction prompt against Gemini 2.5 Flash client-side
  when `VITE_GEMINI_API_KEY` is set; otherwise returns a representative sample so the
  flow always demos.
- Prompt extracts: section, type, AY, assessee + PAN, AO/ward, jurisdiction,
  **`is_faceless` + `assessment_regime`**, issue/compliance dates, key issues,
  per-document requests (with `tally_exportable` + `suggested_source`),
  `act_references` with bidirectional 1961↔2025 mapping, response/DSC guidance,
  and **per-field confidence scores**.

**Triage (Edge Function)**
- `supabase/functions/triage-case` calls Gemini Pro to produce discrepancies,
  section mapping, risk assessment, summary, and a draft response.
- `supabase/functions/extract-notice` is the server-side counterpart to client extraction.

### Data model (Supabase migrations)

- **`001_initial_schema.sql`** — `firms`, `users`, `cases`, `notices`,
  `checklist_items`, `magic_links`, `client_uploads`, `extractions`, `triage_results`.
  Cases carry a full status enum (`new → extraction_pending → awaiting_documents →
  documents_received → triage_pending → triage_complete → draft_ready →
  response_filed → closed`) and priority levels.
- **`002_ecosystem_integration.sql`** — adds `is_faceless`, `assessment_regime`,
  `tally_company_name`, `tally_import_status` to `cases`; a `client_financial_data`
  table; `reference_guidance` JSON on extractions; and `tally_exportable` /
  `suggested_source` on checklist items.

### Project layout

```
src/
  components/  layout · dashboard · upload · case · client-portal · shared
  hooks/       useCases
  lib/         supabase · gemini · utils · demoStore
  pages/       Dashboard · NewCase · CasePage · Portal
supabase/
  migrations/  001_initial_schema.sql · 002_ecosystem_integration.sql
  functions/   extract-notice · triage-case
  seed.sql
```

---

## 3. Integration Roadmap (status)

| Phase | Scope | Status |
| --- | --- | --- |
| **1 — Passive (MVP)** | "Export from Tally" hints, Faceless detection, 1961↔2025 cross-reference | **Built** |
| **2 — Active (M2–3)** | Tally XML import, 26AS/AIS JSON ingestion, auto-reconciliation; Response tab (draft + Word + e-Proceedings jump) | Planned / scaffolded |
| **3 — Deep (M4–6)** | IT-portal sync (ERI), DSC signing, e-Proceedings upload prep, Tally HTTP API (`localhost:9000`) | Future |

---

*Summary:* The full case workflow — upload, AI extraction with faceless detection and
act mapping, case dashboard, client document portal, reconciliation and research
views — is implemented and demoable end-to-end (with or without a backend). The
Response/filing step and active data ingestion (Tally/26AS/AIS) are the next build.
