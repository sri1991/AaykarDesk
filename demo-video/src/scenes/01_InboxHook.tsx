import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, Pill } from '../components/ui';
import { useFadeInOut, usePop } from '../utils/anim';

// Scene 01 (0–90 / 3s): the inbox sting. A scrutiny-notice email lands; a red
// deadline chip counts down. Sets the stakes in one breath.
export const InboxHook: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(90);
  const pop = usePop(8);

  // Countdown days — Math.round so we never show "13.7 days" (gotcha #5).
  const days = Math.round(interpolate(frame, [10, 45], [21, 13], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ background: theme.stage, alignItems: 'center', justifyContent: 'center', fontFamily: bodyFont, opacity }}>
      <div style={{ width: 1180, transform: `scale(${pop})` }}>
        <div style={{ color: theme.inkFaint, fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 22 }}>Inbox · 1 new</div>
        <div style={{ background: theme.card, borderRadius: 16, padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 28, boxShadow: '0 30px 90px rgba(0,0,0,0.5)', borderLeft: `6px solid ${theme.urgency.high}` }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: theme.navy[900], color: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: displayFont, fontWeight: 700, fontSize: 26 }}>IT</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: theme.inkSoft, marginBottom: 4 }}>Income Tax Department · DONOTREPLY@incometax.gov.in</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: theme.ink }}>Notice u/s 143(2) — Scrutiny Assessment, AY 2023–24</div>
            <div style={{ fontSize: 15, color: theme.inkFaint, marginTop: 6, fontFamily: monoFont }}>Attachment: notice_143_2.pdf</div>
          </div>
          <Pill color={theme.urgency.high}>⏱ Due in {days} days</Pill>
        </div>
        <div style={{ marginTop: 40, fontFamily: displayFont, fontSize: 40, color: theme.white, fontWeight: 600 }}>The clock just started.</div>
      </div>
    </AbsoluteFill>
  );
};
