import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill } from '../components/ui';
import { useFadeInOut, useCountUp } from '../utils/anim';

// Scene 11 (1980–2220 / 8s): pull back to the firm-wide dashboard. Stat
// counters count UP (integers only — gotcha #5) over a dense case table.
const STATS = [
  { label: 'Open cases', value: 14, color: theme.status.new },
  { label: 'Due this week', value: 3, color: theme.urgency.high },
  { label: 'Awaiting docs', value: 6, color: theme.status.pending },
  { label: 'Avg. setup time', value: 47, suffix: 's', color: theme.urgency.low },
];

const CASES = [
  { id: 'AD-2026-8417', client: 'Sharma Textiles Pvt Ltd', sec: '143(2)', status: 'awaiting docs', sc: theme.status.pending, due: '13d', dc: theme.urgency.high },
  { id: 'AD-2026-8392', client: 'Verma & Associates', sec: '142(1)', status: 'triage complete', sc: theme.status.complete, due: '21d', dc: theme.urgency.medium },
  { id: 'AD-2026-8375', client: 'Nair Exports LLP', sec: '148', status: 'response filed', sc: theme.status.filed, due: '—', dc: theme.inkFaint },
  { id: 'AD-2026-8361', client: 'Iyer Constructions', sec: '143(2)', status: 'documents received', sc: theme.status.active, due: '9d', dc: theme.urgency.high },
];

export const CaseDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(240);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome>
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 700, color: theme.ink, marginBottom: 20 }}>Case Dashboard</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 26 }}>
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${theme.line}` }}>
            {CASES.map((c, i) => {
              const appear = interpolate(frame, [40 + i * 12, 54 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1.4fr 0.8fr', alignItems: 'center', background: theme.card, borderTop: i ? `1px solid ${theme.line}` : 'none', padding: '16px 22px', opacity: appear }}>
                  <span style={{ fontFamily: monoFont, fontSize: 15, color: theme.navy[700], fontWeight: 600 }}>{c.id}</span>
                  <span style={{ fontSize: 17, color: theme.ink, fontWeight: 500 }}>{c.client}</span>
                  <span style={{ fontFamily: monoFont, fontSize: 15, color: theme.inkSoft }}>{c.sec}</span>
                  <Pill color={c.sc} faint>{c.status}</Pill>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.dc, textAlign: 'right' }}>{c.due}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};

const StatCard: React.FC<{ label: string; value: number; suffix?: string; color: string }> = ({ label, value, suffix, color }) => {
  const n = useCountUp(value, 8, 28); // integer count-up
  return (
    <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.line}`, padding: '20px 24px', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkFaint, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: displayFont, fontSize: 44, fontWeight: 700, color: theme.ink }}>{n}{suffix || ''}</div>
    </div>
  );
};
