import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont } from '../components/ui';
import { useFadeInOut } from '../utils/anim';

// Scene 02 (90–210 / 4s): the five-tool grind. Tabs flick open one by one.
//
// ⚠️ HIGHEST-RISK ASSET (handoff gotcha #1): these are styled brand-color
// placeholders. Before shipping, swap each `dot` for a REAL favicon:
//     <Img src={staticFile('assets/favicons/jamku.png')} style={{width:18,height:18}} />
// Generic placeholders here will make the pitch fall flat — do not ship them.
const TABS = [
  { name: 'Jamku — Notice Tracker', color: '#2563eb' },
  { name: 'TallyPrime', color: '#1b9e4b' },
  { name: 'Taxmann.AI Research', color: '#c026d3' },
  { name: 'Income Tax e-Filing Portal', color: '#0e7490' },
  { name: 'WhatsApp — Client', color: '#25d366' },
];

export const BrowserTabsPain: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(120);

  return (
    <AbsoluteFill style={{ background: theme.stage, alignItems: 'center', justifyContent: 'center', fontFamily: bodyFont, opacity }}>
      <div style={{ width: 1500, borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}>
        <div style={{ background: '#dde3ea', display: 'flex', alignItems: 'flex-end', padding: '10px 12px 0', gap: 6 }}>
          {TABS.map((t, i) => {
            const appear = interpolate(frame, [i * 14, i * 14 + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={t.name} style={{ opacity: appear, transform: `translateY(${(1 - appear) * 8}px)`, background: theme.white, borderRadius: '10px 10px 0 0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.ink, maxWidth: 230, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {/* swap this dot for a real favicon <Img/> — see note above */}
                <div style={{ width: 16, height: 16, borderRadius: 4, background: t.color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                <span style={{ color: theme.inkFaint, marginLeft: 4 }}>×</span>
              </div>
            );
          })}
        </div>
        <div style={{ height: 520, background: theme.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <div style={{ fontFamily: displayFont, fontSize: 64, fontWeight: 700, color: theme.ink }}>5 tools.</div>
          <div style={{ fontFamily: displayFont, fontSize: 64, fontWeight: 700, color: theme.ink }}>5 context switches.</div>
          <div style={{ fontSize: 30, color: theme.urgency.high, fontWeight: 700, marginTop: 8 }}>4–6 hours of pure admin. Per notice.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
