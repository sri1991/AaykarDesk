import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill } from '../components/ui';
import { useFadeInOut, usePop } from '../utils/anim';

// Scene 10 (1680–1980 / 10s): the research tab. 1961 ↔ 2025 Act mapping done
// automatically, plus a pre-built Taxmann.AI deep link (cursor taps it ~f1800).
const MAP = [
  { old: 'Sec 143(2)', neu: 'Sec 270 (2025)', topic: 'Scrutiny notice' },
  { old: 'Sec 142(1)', neu: 'Sec 268 (2025)', topic: 'Inquiry before assessment' },
  { old: 'Sec 68', neu: 'Sec 102 (2025)', topic: 'Unexplained cash credits' },
  { old: 'Rule 11UA', neu: 'Rule 11UA', topic: 'Valuation method' },
];

export const ResearchTab: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(300);
  const btnPop = usePop(150, 0.9);
  const tap = interpolate(frame, [185, 192, 200], [1, 0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome tab="Research" caseLabel="AD-2026-8417">
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: theme.ink, marginBottom: 8 }}>Legal Research</div>
          <div style={{ fontSize: 16, color: theme.inkSoft, marginBottom: 22 }}>Act section mapping — Income-tax Act 1961 ↔ 2025</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MAP.map((m, i) => {
              const appear = interpolate(frame, [20 + i * 16, 36 + i * 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={m.old} style={{ opacity: appear, transform: `translateX(${(1 - appear) * -24}px)`, background: theme.card, border: `1px solid ${theme.line}`, borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: theme.navy[700], minWidth: 130 }}>{m.old}</span>
                  <span style={{ fontSize: 22, color: theme.inkFaint }}>→</span>
                  <span style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: theme.urgency.low, minWidth: 160 }}>{m.neu}</span>
                  <span style={{ flex: 1, fontSize: 16, color: theme.inkSoft }}>{m.topic}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ transform: `scale(${btnPop * tap})`, background: '#c026d3', color: theme.white, fontWeight: 700, fontSize: 18, padding: '16px 28px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 16px 40px rgba(192,38,211,0.35)' }}>
              ✦ Open in Taxmann.AI — pre-built query
            </div>
            <Pill color={theme.navy[600]} faint>saves ~45 min of manual search</Pill>
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
