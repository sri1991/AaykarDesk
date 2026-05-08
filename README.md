# AaykarDesk

> **From notice to response — without switching tabs.**

AaykarDesk is the orchestration layer for Indian Chartered Accountants handling income tax
scrutiny notices. It connects the tools a CA already uses — Jamku/ATOM, TallyPrime, Taxmann.AI,
the IT portal — into a single case workflow. Upload a notice PDF, AI extracts the key fields, a
case is created, a magic link is shared with the client for document collection, and AI triages
the case for the CA.

## Competitive positioning

AaykarDesk is **not** competing with:

- **Jamku / ATOM Pro** — notice tracking & DSC management
- **TallyPrime** — books of accounts & reconciliation
- **Taxmann.AI** — legal research & case law search
- **ClearTax / Saral** — return filing

AaykarDesk **is** the orchestration layer that connects these tools into a single case workflow,
and eliminates the 4–6 hours of admin between them.

## Stack

- React 18 + Vite + Tailwind 3 + React Router 6
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Gemini 2.5 Flash (extraction) + Gemini 2.5 Pro (triage)
- Vercel for the frontend

## Local development

```bash
npm install
cp .env.example .env   # fill in keys (optional for demo)
npm run dev
```

The app runs against an in-memory + localStorage demo store when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
are missing, so you can demo end-to-end with no backend. Six pre-seeded cases appear on first load,
including faceless and jurisdictional examples plus a Tally-imported reconciliation.

The notice extraction step works without a Gemini key — a representative sample extraction is
returned. With `VITE_GEMINI_API_KEY` set, the real Gemini 2.5 Flash extraction runs client-side.

## Routes

| Route | Description |
| --- | --- |
| `/cases` | Case dashboard (stats + dense table) |
| `/cases/new` | Upload → AI extract → confirm → create |
| `/cases/:id` | Tabbed case detail (Notice · Documents · Reconciliation · Research · Response) |
| `/portal/:token` | Public client portal — no auth, mobile-friendly |

### Case detail tabs

- **Notice** — uploaded PDF + extracted fields + deadline banner + Faceless/Jurisdictional regime badge
- **Documents** — checklist with per-item source hints (Tally / bank / employer / portal / client) + magic link
- **Reconciliation** — side-by-side comparison of "As per Notice / 26AS" vs "As per Client Records" with mismatches highlighted
- **Research** — extracted act references with 1961 ↔ 2025 mapping, relevant Rules, and a pre-built Taxmann.AI deep link
- **Response** — (Phase 2) template draft, Word download, and a one-click jump to IT Portal e-Proceedings

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`, then `002_ecosystem_integration.sql` in the SQL editor.
3. Create two storage buckets (private): `notices`, `client-uploads`.
4. (Optional) Run `supabase/seed.sql` for demo cases.
5. Deploy edge functions:
   ```bash
   supabase functions deploy extract-notice
   supabase functions deploy triage-case
   supabase secrets set GEMINI_API_KEY=...
   ```

## Deploy

Frontend deploys to Vercel as a static SPA — `vercel.json` rewrites all paths to `index.html`.
Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY` in the project's env settings.

## Demo script (CA partner meeting)

> "Let me show you how AaykarDesk fits into your existing workflow."

1. **The problem.** Today your clerk gets a 143(2) notice. They log it in Jamku, check Tally for
   the books, search Taxmann for sections, WhatsApp the client for documents, and draft in Word.
   Five tools, five context switches. The deadline tracking lives in their head.
2. **The upload.** Drop the notice PDF. In 3 seconds, AaykarDesk extracts everything — section, AY,
   deadline, AO, and every document the annexure requests. It even detects this is a Faceless
   assessment.
3. **The client handoff.** See these 8 documents? Your clerk normally calls or WhatsApps the client,
   who sends back 4 blurry photos and 2 wrong files. Instead — one link. The client sees a checklist,
   uploads each document, you get notified when they're done.
4. **The intelligence.** The Research tab already mapped Section 143(2) to the 2025 Act equivalent
   and generated a Taxmann search query for the specific issues raised. Your clerk would have spent
   45 minutes finding this. It's here in the case file.
5. **The ask.** Everything your clerk does today still happens. Jamku still tracks your notices.
   Tally still holds the books. Taxmann is still your research bible. AaykarDesk just eliminates
   the 4–6 hours of admin between them.

## Ecosystem integration roadmap

**Phase 1 (MVP) — passive integration**
- Pre-built Taxmann.AI search links (deep link with query params)
- "Export from Tally" hints on checklist items
- Faceless vs jurisdictional regime detection
- Act section 1961 ↔ 2025 cross-reference

**Phase 2 (Month 2–3) — active integration**
- Tally XML import parser (TallyPrime exports to XML)
- 26AS JSON ingestion (from IT portal download)
- AIS data ingestion
- Auto-reconciliation between Tally data and 26AS

**Phase 3 (Month 4–6) — deep integration**
- Jamku-style IT portal sync (requires ERI authorization)
- DSC signing workflow
- e-Proceedings portal response upload preparation
- Tally direct API (TallyPrime exposes an HTTP API on `localhost:9000`)

## Key metrics tracked from day 1

- Time from notice upload to case creation (target: < 60 seconds)
- Extraction accuracy per field (track confidence scores, including faceless detection)
- Magic link open rate
- Document upload completion rate (X of Y checklist items uploaded)
- Time from magic link share to all documents received
- Cases per firm per month (usage depth)
- Taxmann deep link click rate (validates research tab value)

## Project layout

```
src/
  components/
    layout/        AppShell, Sidebar, TopBar
    dashboard/     CaseDashboard, CaseRow, DeadlineIndicator
    upload/        NoticeUpload, ExtractionReview, CaseCreateForm
    case/          CaseDetail (tabbed), ReconciliationTab, ResearchTab, ResponseTab,
                   CaseTimeline, ChecklistPanel, TriageSummary, MagicLinkPanel, RegimeBadge
    client-portal/ ClientPortal, DocumentChecklist, FileUploader
    shared/        StatusBadge, PriorityBadge, EmptyState, LoadingSpinner
  hooks/           useCases (and friends)
  lib/             supabase, gemini, utils, demoStore
  pages/           Dashboard, NewCase, CasePage, Portal
supabase/
  migrations/      001_initial_schema.sql, 002_ecosystem_integration.sql
  functions/       extract-notice, triage-case
  seed.sql
```
