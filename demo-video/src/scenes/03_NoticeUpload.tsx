import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome } from '../components/ui';
import { useFadeInOut } from '../utils/anim';

// Scene 03 (210–300 / 3s): the pivot. The notice PDF drops into AaykarDesk's
// upload zone — the cursor (global) is dragging it in over these frames.
export const NoticeUploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(90);

  // PDF card travels into the dropzone and settles.
  const drop = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardY = interpolate(drop, [0, 1], [-180, 0]);
  const dz = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome>
        <div style={{ position: 'absolute', inset: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, fontFamily: bodyFont }}>
          <div style={{ fontFamily: displayFont, fontSize: 30, fontWeight: 700, color: theme.ink }}>New Case</div>
          <div style={{ width: 760, height: 360, borderRadius: 20, border: `3px dashed ${dz > 0.5 ? theme.navy[700] : theme.inkFaint}`, background: dz > 0.5 ? `${theme.navy[600]}11` : theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'none' }}>
            <div style={{ position: 'absolute', transform: `translateY(${cardY}px)`, opacity: drop, width: 200, height: 250, background: theme.white, borderRadius: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: `1px solid ${theme.line}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ alignSelf: 'flex-end', background: theme.urgency.high, color: theme.white, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontFamily: monoFont }}>PDF</div>
              {[1, 0.9, 0.95, 0.6, 0.85, 0.7, 0.9].map((w, i) => (
                <div key={i} style={{ height: 8, width: `${w * 100}%`, background: theme.line, borderRadius: 3 }} />
              ))}
            </div>
            {drop < 0.4 && <div style={{ fontSize: 20, color: theme.inkFaint }}>Drop the notice PDF here</div>}
          </div>
          <div style={{ fontSize: 22, color: theme.inkSoft }}>Drop the notice. That's the whole job.</div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
