// Palette mirrors the real AaykarDesk app (tailwind.config.js) so the video
// reads as the actual product, not a lookalike. Dark cinematic stage (#0A0A0A)
// with the app's cream/navy surfaces floating on top.
export const theme = {
  stage: '#0A0A0A',
  stageSoft: '#0a1929', // navy-950
  card: '#fefdfb', // cream-50  — app surfaces
  cream: '#fdf8f0', // cream-100
  creamLine: '#f5e6cc', // cream-300
  line: '#d9e2ec', // navy-100
  ink: '#102a43', // navy-900  — primary text on light
  inkSoft: '#486581', // navy-600
  inkFaint: '#829ab1', // navy-400
  white: '#ffffff',
  navy: {
    600: '#486581',
    700: '#334e68',
    800: '#243b53',
    900: '#102a43',
    950: '#0a1929',
  },
  urgency: { low: '#2d6a4f', medium: '#e09f3e', high: '#d62828', overdue: '#6a040f' },
  status: { new: '#486581', pending: '#e09f3e', active: '#2d6a4f', complete: '#1b4332', filed: '#334e68' },
} as const;

// Confidence-score color ramp used by the extraction chips.
export const confidenceColor = (score: number): string =>
  score >= 0.9 ? theme.urgency.low : score >= 0.75 ? theme.urgency.medium : theme.urgency.high;
