import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill } from '../components/ui';
import { confidenceColor } from '../theme';
import { useFadeInOut } from '../utils/anim';

// Scene 04 (300–540 / 8s): the magic. Fields resolve out of a shimmering
// skeleton, each landing with a per-field confidence chip.
//
// The shimmer is an ANIMATED linear-gradient mask (handoff gotcha #2), not a
// static image — a highlight band sweeps left→right across each skeleton bar.
const Shimmer: React.FC<{ w: number; h?: number }> = ({ w, h = 22 }) => {
  const frame = useCurrentFrame();
  const pos = interpolate(frame % 45, [0, 45], [-150, 250]); // sweep, looping
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: `linear-gradient(90deg, ${theme.line} 0%, ${theme.line} 35%, #ffffff 50%, ${theme.line} 65%, ${theme.line} 100%)`,
        backgroundSize: '250% 100%',
        backgroundPositionX: `${pos}%`,
      }}
    />
  );
};

type F = { label: string; value: string; conf: number; reveal: number; mono?: boolean };
const FIELDS: F[] = [
  { label: 'Section', value: '143(2)', conf: 0.98, reveal: 35, mono: true },
  { label: 'Assessment Year', value: '2023–24', conf: 0.97, reveal: 50 },
  { label: 'Assessee', value: 'Sharma Textiles Pvt Ltd', conf: 0.95, reveal: 65 },
  { label: 'PAN', value: 'AABCS1429K', conf: 0.99, reveal: 80, mono: true },
  { label: 'Assessing Officer', value: 'NaFAC, Delhi', conf: 0.91, reveal: 95 },
  { label: 'Compliance Deadline', value: '30 Jun 2026', conf: 0.96, reveal: 110 },
  { label: 'Documents Requested', value: '8 items', conf: 0.93, reveal: 125 },
  { label: 'Regime', value: 'Faceless', conf: 0.94, reveal: 140 },
];

export const ExtractionReview: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(240);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome tab="Notice" caseLabel="Extracting…">
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: theme.ink }}>AI Extraction</div>
            <Pill color={theme.navy[600]} faint>✦ Gemini 2.5 Flash</Pill>
            <span style={{ color: theme.inkFaint, fontSize: 14 }}>read the notice in ~3 seconds</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>
            {FIELDS.map((f) => {
              const resolved = frame >= f.reveal;
              const fade = interpolate(frame, [f.reveal, f.reveal + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={f.label} style={{ background: theme.card, borderRadius: 12, padding: '16px 20px', border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 74 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkFaint, marginBottom: 8 }}>{f.label}</div>
                    {resolved ? (
                      <div style={{ fontSize: 20, fontWeight: 600, color: theme.ink, opacity: fade, fontFamily: f.mono ? monoFont : bodyFont }}>{f.value}</div>
                    ) : (
                      <Shimmer w={160} />
                    )}
                  </div>
                  {resolved && (
                    <div style={{ opacity: fade }}>
                      <Pill color={confidenceColor(f.conf)} faint>{Math.round(f.conf * 100)}%</Pill>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
