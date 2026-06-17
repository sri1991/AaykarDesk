import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill } from '../components/ui';
import { useFadeInOut, useSlideIn } from '../utils/anim';

// Scene 07 (840–1080 / 8s): the auto-built checklist + the magic link. Each
// item carries a "where to fetch it from" source hint.
const DOCS = [
  { name: 'Audited Financial Statements', src: 'Tally', srcColor: '#1b9e4b' },
  { name: 'Bank Statements (FY 2022-23)', src: 'Bank', srcColor: '#2563eb' },
  { name: 'Form 26AS', src: 'Govt Portal', srcColor: '#0e7490' },
  { name: 'GST Returns (GSTR-3B)', src: 'Tally', srcColor: '#1b9e4b' },
  { name: 'Sales / Purchase Ledger', src: 'Tally', srcColor: '#1b9e4b' },
  { name: 'TDS Certificates', src: 'Employer', srcColor: '#9333ea' },
  { name: 'Loan Confirmations', src: 'Client Records', srcColor: '#b45309' },
  { name: 'Form 3CD (Tax Audit)', src: 'Client Records', srcColor: '#b45309' },
];

export const DocumentsTab: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(240);
  const linkX = useSlideIn(60, -40);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome tab="Documents" caseLabel="AD-2026-8417">
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, color: theme.ink, marginBottom: 18 }}>Document Checklist · 8 items</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px' }}>
            {DOCS.map((d, i) => {
              const appear = interpolate(frame, [i * 7, i * 7 + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={d.name} style={{ opacity: appear, transform: `translateX(${(1 - appear) * -20}px)`, background: theme.card, border: `1px solid ${theme.line}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${theme.inkFaint}` }} />
                  <span style={{ flex: 1, fontSize: 17, color: theme.ink, fontWeight: 500 }}>{d.name}</span>
                  <Pill color={d.srcColor} faint>{d.src}</Pill>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 30, transform: `translateX(${linkX}px)`, background: theme.navy[900], borderRadius: 14, padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ color: theme.cream, fontSize: 17, fontWeight: 600 }}>🔗 Client upload link</span>
            <span style={{ flex: 1, fontFamily: monoFont, fontSize: 16, color: theme.inkFaint, background: theme.navy[950], padding: '10px 16px', borderRadius: 8 }}>aaykardesk.app/portal/7f3a…e91c</span>
            <div style={{ background: theme.cream, color: theme.navy[900], fontWeight: 700, padding: '10px 22px', borderRadius: 8, fontSize: 16 }}>Copy link</div>
          </div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
