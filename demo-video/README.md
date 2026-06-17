# AaykarDesk — Pitch Video (Remotion)

A 90-second, 1920×1080 / 30fps product film: from a scrutiny notice landing in
the inbox to a firm-wide dashboard. Built as **Remotion-native React** (every
scene is drawn in code, not screenshots), so it renders crisp at any scale and
re-renders instantly when copy changes.

> **From notice to response — without switching tabs.**

## Quick start

```bash
cd demo-video
npm install
npm run dev      # opens Remotion Studio to scrub the timeline
```

Render the final MP4:

```bash
npm run render   # → out/aaykardesk-demo.mp4  (h264, crf 18, yuv420p)
```

It renders **with no assets supplied** — audio is gated off by default and the
visuals are self-contained. Add the media in `public/` and flip `ENABLE_AUDIO`
to ship the finished cut. See [`public/README.md`](./public/README.md).

## Timeline (2700 frames / 90s @ 30fps)

| # | Scene | Frames | Beat |
|---|-------|--------|------|
| 01 | `InboxHook` | 0–90 | Notice lands, deadline clock starts |
| 02 | `BrowserTabsPain` | 90–210 | 5 tools, 5 context switches, 4–6 hrs |
| 03 | `NoticeUpload` | 210–300 | Drop the PDF — the pivot |
| 04 | `ExtractionReview` | 300–540 | Fields resolve from shimmer + confidence |
| 05 | `RegimeBadge` | 540–660 | Faceless/NaFAC detected |
| 06 | `CaseDetail` | 660–840 | Case `AD-2026-8417` created |
| 07 | `DocumentsTab` | 840–1080 | Auto checklist + magic link |
| 08 | `SplitScreenPortal` | 1080–1380 | Client phone ↔ CA desktop, live |
| 09 | `Reconciliation` | 1380–1680 | Notice/26AS vs books, mismatch flagged |
| 10 | `Research` | 1680–1980 | 1961 ↔ 2025 mapping + Taxmann link |
| 11 | `Dashboard` | 1980–2220 | Firm-wide stats + case table |
| 12 | `EndCard` | 2220–2700 | Tagline + CTA |

Durations are the single source of truth in `src/AaykarDeskDemo.tsx` (`SCENES`).
Change one `dur` and shift the following `from`s — nothing else depends on them.

## Project layout

```
src/
├── index.ts                 registerRoot
├── Root.tsx                 <Composition> (2700f, 30fps, 1920×1080)
├── AaykarDeskDemo.tsx       master timeline + audio + global cursor
├── theme.ts                 palette mirrored from the app's tailwind config
├── fonts.ts                 DM Sans / Source Serif 4 / JetBrains Mono
├── utils/
│   ├── anim.ts              useFadeIn · useSlideIn · usePop · useCountUp(int)
│   └── Cursor.tsx           ONE cursor, absolute-frame waypoints
├── components/
│   └── ui.tsx               BrowserChrome · AppChrome · Logo · Pill · Field
└── scenes/                  01_… → 12_…  (one file per beat)
public/                      VO, BGM, favicons (git-ignored; see its README)
```

## Notes baked in from the handoff

- **Shimmer (scene 04)** is an animated `linear-gradient` mask, not a static image.
- **Split screen (scene 08)** uses two regions at different `transform: scale()` —
  the phone is the focal point at native size, the desktop sits zoomed out behind it.
- **One cursor** (`Cursor.tsx`) spans the whole film via `[frame, x, y]` waypoints.
- **Counters** (`useCountUp`, scenes 01 & 11) are always `Math.round`-ed.
- **Favicons (scene 02)** are styled placeholders — swap in real logos before shipping.
- **Fonts** corrected from "Inter" (handoff) to the app's actual three families.
