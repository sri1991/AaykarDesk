import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont } from '../components/ui';
import { useFadeInOut } from '../utils/anim';

// Scene 08 (1080–1380 / 10s): the client handoff. Split stage —
//   LEFT  : the CA's desktop, scaled DOWN (context, secondary focus)
//   RIGHT : the client's phone, at native scale (the focal point)
// As the client taps upload on the phone, checks light up on BOTH sides live.
// (Handoff gotcha #3: two AbsoluteFill regions, different transform: scale().)
const ITEMS = ['Financial Statements', 'Bank Statements', 'Form 26AS', 'GST Returns', 'TDS Certificates'];

// Each item gets "uploaded" at a staggered frame.
const uploadFrame = (i: number) => 40 + i * 40;

export const SplitScreenPortal: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(300);
  const done = (i: number) => frame >= uploadFrame(i);
  const uploadedCount = ITEMS.filter((_, i) => done(i)).length;

  return (
    <AbsoluteFill style={{ background: theme.stage, fontFamily: bodyFont, opacity }}>
      {/* LEFT — desktop, zoomed out so the phone reads as the hero */}
      <AbsoluteFill style={{ width: '58%', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: 'scale(0.82)', width: 920, height: 600, background: theme.cream, borderRadius: 16, border: `1px solid ${theme.navy[800]}`, boxShadow: '0 30px 80px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
          <div style={{ height: 50, background: theme.navy[900], display: 'flex', alignItems: 'center', padding: '0 22px', color: theme.cream, fontFamily: displayFont, fontWeight: 700, fontSize: 18 }}>AaykarDesk · AD-2026-8417</div>
          <div style={{ padding: 26 }}>
            <div style={{ fontSize: 16, color: theme.inkSoft, marginBottom: 16 }}>Documents received: <b style={{ color: theme.ink }}>{uploadedCount} / {ITEMS.length}</b></div>
            {ITEMS.map((it, i) => (
              <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${theme.line}` }}>
                <Check on={done(i)} />
                <span style={{ fontSize: 17, color: done(i) ? theme.ink : theme.inkFaint }}>{it}</span>
                {done(i) && <span style={{ marginLeft: 'auto', fontSize: 13, color: theme.urgency.low, fontWeight: 600 }}>uploaded ✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 22, color: theme.inkFaint, fontSize: 16 }}>CA's dashboard — updates live</div>
      </AbsoluteFill>

      {/* RIGHT — the phone, native scale, the focal point */}
      <AbsoluteFill style={{ left: '58%', width: '42%', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 360, height: 740, background: '#111', borderRadius: 44, padding: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          <div style={{ width: '100%', height: '100%', background: theme.white, borderRadius: 34, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: theme.navy[900], color: theme.cream, padding: '28px 22px 18px', fontFamily: displayFont }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Secure document request</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Sharma Textiles</div>
            </div>
            <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ITEMS.map((it, i) => {
                const justUploaded = frame >= uploadFrame(i) && frame < uploadFrame(i) + 14;
                return (
                  <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${done(i) ? theme.urgency.low : theme.line}`, background: done(i) ? `${theme.urgency.low}10` : theme.white, transform: `scale(${justUploaded ? 1.04 : 1})` }}>
                    <Check on={done(i)} />
                    <span style={{ flex: 1, fontSize: 15, color: theme.ink }}>{it}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: done(i) ? theme.urgency.low : theme.navy[600] }}>{done(i) ? 'Done' : 'Upload'}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: 16, fontFamily: monoFont, fontSize: 11, color: theme.inkFaint, textAlign: 'center' }}>no app · no login · mobile-friendly</div>
          </div>
        </div>
        <div style={{ marginTop: 22, fontFamily: displayFont, fontSize: 24, color: theme.white, fontWeight: 600 }}>One link. Not 14 WhatsApps.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <div style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, background: on ? theme.urgency.low : 'transparent', border: on ? 'none' : `2px solid ${theme.inkFaint}`, color: theme.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
    {on ? '✓' : ''}
  </div>
);
