import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill } from '../components/ui';
import { useFadeInOut } from '../utils/anim';

// Scene 09 (1380–1680 / 10s): side-by-side reconciliation. Notice/26AS vs the
// client's books — the one mismatch that matters lights up red.
const ROWS = [
  { label: 'Gross Receipts', notice: '₹ 4,82,00,000', client: '₹ 4,82,00,000', match: true },
  { label: 'TDS Credit (26AS)', notice: '₹ 9,64,000', client: '₹ 9,64,000', match: true },
  { label: 'Interest Income', notice: '₹ 3,10,000', client: '₹ 1,90,000', match: false },
  { label: 'GST Turnover', notice: '₹ 4,80,00,000', client: '₹ 4,80,00,000', match: true },
  { label: 'Cash Deposits', notice: '₹ 22,00,000', client: '₹ 22,00,000', match: true },
];

export const ReconciliationTab: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(300);
  const flash = interpolate(frame % 50, [0, 25, 50], [0.08, 0.22, 0.08]); // pulse on mismatch

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome tab="Reconciliation" caseLabel="AD-2026-8417">
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: theme.ink, marginBottom: 20 }}>Reconciliation</div>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.line}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.6fr', background: theme.navy[900], color: theme.cream, fontSize: 15, fontWeight: 600 }}>
              <div style={{ padding: '16px 22px' }}>Line item</div>
              <div style={{ padding: '16px 22px' }}>As per Notice / 26AS</div>
              <div style={{ padding: '16px 22px' }}>As per Client Records</div>
              <div style={{ padding: '16px 22px' }}>Status</div>
            </div>
            {ROWS.map((r, i) => {
              const appear = interpolate(frame, [20 + i * 12, 32 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.6fr', background: r.match ? theme.card : `rgba(214,40,40,${flash})`, borderTop: `1px solid ${theme.line}`, opacity: appear, alignItems: 'center' }}>
                  <div style={{ padding: '18px 22px', fontSize: 17, fontWeight: 600, color: theme.ink }}>{r.label}</div>
                  <div style={{ padding: '18px 22px', fontFamily: monoFont, fontSize: 16, color: theme.ink }}>{r.notice}</div>
                  <div style={{ padding: '18px 22px', fontFamily: monoFont, fontSize: 16, color: r.match ? theme.ink : theme.urgency.high, fontWeight: r.match ? 400 : 700 }}>{r.client}</div>
                  <div style={{ padding: '18px 22px' }}>
                    {r.match ? <Pill color={theme.urgency.low} faint>match</Pill> : <Pill color={theme.urgency.high}>₹1.2L gap</Pill>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24, fontSize: 22, color: theme.inkSoft }}>The discrepancy the AO will ask about — surfaced before you reply.</div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
