# Asset checklist (`public/`)

The video renders **today with zero assets** — audio is gated behind
`ENABLE_AUDIO` in `src/AaykarDeskDemo.tsx` and every scene draws its own UI in
React. The list below is what to drop in to take it from "renders" to "ships".

The heavy media here is **git-ignored** (see `../.gitignore`) — the producer
supplies it; only the folder structure (`.gitkeep`) is committed.

```
public/
├── vo/                     ← 12 ElevenLabs MP3s. Filenames MUST match the
│   ├── 01_hook.mp3            `vo:` keys in src/AaykarDeskDemo.tsx exactly.
│   ├── 02_pain.mp3
│   ├── 03_pivot.mp3
│   ├── 04_extract.mp3
│   ├── 05_regime.mp3
│   ├── 06_case_created.mp3
│   ├── 07_handoff.mp3
│   ├── 08_portal.mp3
│   ├── 09_recon.mp3
│   ├── 10_research.mp3
│   ├── 11_dashboard.mp3
│   └── 12_cta.mp3
├── audio/
│   └── bgm.mp3             ← licensed background music, -22 LUFS, ≥90s loop
└── assets/
    ├── notice.pdf          ← (optional) real-looking 143(2) sample
    └── favicons/           ← ⚠️ HIGHEST-RISK ASSET — real logos, not placeholders
        ├── jamku.png          See gotcha in src/scenes/02_BrowserTabsPain.tsx
        ├── tally.png
        ├── taxmann.png
        ├── itportal.png
        └── whatsapp.png
```

## To turn audio on

1. Drop all 13 MP3s into `vo/` and `audio/` with the names above.
2. Set `ENABLE_AUDIO = true` in `src/AaykarDeskDemo.tsx`.
3. The VO drives nothing structurally — scene durations are LOCKED in
   `SCENES`. If a VO line runs long, adjust that scene's `dur` (and every
   `from` after it) in one place.

## To wire the real favicons (do this before shipping)

In `src/scenes/02_BrowserTabsPain.tsx`, replace the colored `dot` div with:

```tsx
import { Img, staticFile } from 'remotion';
<Img src={staticFile('assets/favicons/jamku.png')} style={{ width: 16, height: 16 }} />
```

## Fonts

No font files needed. The app's three families (DM Sans, Source Serif 4,
JetBrains Mono) load via `@remotion/google-fonts` in `src/fonts.ts`. The
original handoff said "Inter" — that was wrong; these match the real app.
