# AaykarDesk

Case workflow orchestration tool for Chartered Accountants handling income tax scrutiny notices. Upload a notice PDF, AI extracts the key fields, a case is created, a magic link is shared with the client for document collection, and AI triages the case for the CA.

## Stack

- React 18 + Vite + Tailwind 3 + React Router 6
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Gemini 1.5 Flash (extraction) + Gemini 1.5 Pro (triage)
- Vercel for the frontend

## Local development

```bash
npm install
cp .env.example .env   # fill in keys (optional for demo)
npm run dev
```

The app runs against an in-memory + localStorage demo store when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are missing, so you can demo end-to-end with no backend. Six pre-seeded cases appear on first load.

The notice extraction step works without a Gemini key — a representative sample extraction is returned. With `VITE_GEMINI_API_KEY` set, the real Gemini 1.5 Flash extraction runs client-side.

## Routes

| Route | Description |
| --- | --- |
| `/cases` | Case dashboard (stats + dense table) |
| `/cases/new` | Upload → AI extract → confirm → create |
| `/cases/:id` | Case detail (info, checklist, magic link, triage, timeline) |
| `/portal/:token` | Public client portal — no auth, mobile-friendly |

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Create two storage buckets (private): `notices`, `client-uploads`.
4. (Optional) Run `supabase/seed.sql` for demo cases.
5. Deploy edge functions:
   ```bash
   supabase functions deploy extract-notice
   supabase functions deploy triage-case
   supabase secrets set GEMINI_API_KEY=...
   ```

## Deploy

Frontend deploys to Vercel as a static SPA — `vercel.json` rewrites all paths to `index.html`. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY` in the project's env settings.

## Demo script

1. Show the dashboard — six realistic CA cases sorted by deadline.
2. Click **New Case**, drop a notice PDF, watch AI extract section, deadline, AO and the document checklist.
3. Confirm and create — case detail appears with the magic link ready.
4. Share via WhatsApp link → opens portal on phone → upload a document → checklist updates live in the CA dashboard.
5. Run **AI triage** on a case — discrepancies, 1961↔2025 section mapping, risk and a draft response in seconds.

## Project layout

```
src/
  components/
    layout/        AppShell, Sidebar, TopBar
    dashboard/     CaseDashboard, CaseRow, DeadlineIndicator
    upload/        NoticeUpload, ExtractionReview, CaseCreateForm
    case/          CaseDetail, CaseTimeline, ChecklistPanel, TriageSummary, MagicLinkPanel
    client-portal/ ClientPortal, DocumentChecklist, FileUploader
    shared/        StatusBadge, PriorityBadge, EmptyState, LoadingSpinner
  hooks/           useCases (and friends)
  lib/             supabase, gemini, utils, demoStore
  pages/           Dashboard, NewCase, CasePage, Portal
supabase/
  migrations/      001_initial_schema.sql
  functions/       extract-notice, triage-case
  seed.sql
```
