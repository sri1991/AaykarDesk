import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont } from '../components/ui';
import { useFadeInOut, usePop } from '../utils/anim';

// Scene 05 (540–660 / 4s): the detail that earns trust — it knows this is a
// Faceless/NaFAC assessment, and that changes how the CA responds.
export const RegimeBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(120);
  const pop = usePop(10);
  const check = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: theme.stage, alignItems: 'center', justifyContent: 'center', fontFamily: bodyFont, opacity }}>
      <div style={{ textAlign: 'center', transform: `scale(${pop})` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, padding: '26px 46px', borderRadius: 999, background: theme.urgency.low, color: theme.white, fontSize: 44, fontWeight: 700, boxShadow: `0 24px 70px ${theme.urgency.low}66` }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', transform: `scale(${check})` }}>✓</span>
          Faceless · NaFAC
        </div>
        <div style={{ marginTop: 34, fontFamily: displayFont, fontSize: 34, color: theme.white, fontWeight: 600 }}>Regime detected automatically.</div>
        <div style={{ marginTop: 10, fontSize: 20, color: theme.inkFaint }}>No PII to the AO. The right response path, from the first second.</div>
      </div>
    </AbsoluteFill>
  );
};
