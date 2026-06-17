import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, bodyFont, displayFont, monoFont, AppChrome, Pill, Field } from '../components/ui';
import { useFadeInOut, usePop } from '../utils/anim';

// Scene 06 (660–840 / 6s): the case is born. A case number stamps in and the
// header fills with the extracted facts — the file now exists, end to end.
export const CaseDetail: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = useFadeInOut(180);
  const stamp = usePop(12, 1.4);
  const stampOpacity = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <AppChrome tab="Notice" caseLabel="AD-2026-8417">
        <div style={{ fontFamily: bodyFont }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <span style={{ fontFamily: monoFont, fontSize: 30, fontWeight: 700, color: theme.navy[700], transform: `scale(${stamp})`, opacity: stampOpacity }}>AD-2026-8417</span>
            <Pill color={theme.status.pending} faint>● awaiting documents</Pill>
            <Pill color={theme.urgency.high} faint>high priority</Pill>
          </div>
          <div style={{ fontFamily: displayFont, fontSize: 34, fontWeight: 700, color: theme.ink, marginBottom: 28 }}>Sharma Textiles Pvt Ltd</div>

          <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.line}`, padding: 30, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
            <Field label="Section" value="143(2)" mono />
            <Field label="Assessment Year" value="2023–24" />
            <Field label="Assessing Officer" value="NaFAC, Delhi" />
            <Field label="Deadline" value="30 Jun 2026" />
            <Field label="PAN" value="AABCS1429K" mono />
            <Field label="Ward / Circle" value="Circle 12(1)" />
            <Field label="Regime" value="Faceless" />
            <Field label="Documents" value="8 requested" />
          </div>
          <div style={{ marginTop: 26, fontSize: 22, color: theme.inkSoft }}>From PDF to a structured case file — in under a minute.</div>
        </div>
      </AppChrome>
    </AbsoluteFill>
  );
};
