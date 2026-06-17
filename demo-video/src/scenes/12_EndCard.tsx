import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, Logo } from '../components/ui';
import { useFadeInOut, usePop } from '../utils/anim';

// Scene 12 (2220–2700 / 16s): the close. Logo, the tagline, and the CTA.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(480, 18, 24);
  const logoPop = usePop(8);
  const tagIn = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineIn = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctaIn = interpolate(frame, [95, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: theme.stage, alignItems: 'center', justifyContent: 'center', fontFamily: bodyFont, opacity }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ transform: `scale(${logoPop})`, display: 'inline-block' }}>
          <Logo size={64} light />
        </div>
        <div style={{ opacity: tagIn, transform: `translateY(${(1 - tagIn) * 16}px)`, marginTop: 46, fontFamily: displayFont, fontSize: 52, fontWeight: 700, color: theme.white, maxWidth: 1300, lineHeight: 1.2 }}>
          From notice to response —<br />without switching tabs.
        </div>
        <div style={{ opacity: lineIn, marginTop: 26, fontSize: 24, color: theme.inkFaint }}>
          The orchestration layer for Indian CAs. Keep Jamku, Tally, Taxmann — lose the 4–6 hours in between.
        </div>
        <div style={{ opacity: ctaIn, transform: `scale(${0.96 + ctaIn * 0.04})`, marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: theme.cream, color: theme.navy[900], fontWeight: 700, fontSize: 22, padding: '18px 40px', borderRadius: 12 }}>Book a 15-minute demo</div>
          <span style={{ color: theme.inkFaint, fontSize: 20 }}>aaykardesk.app</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
