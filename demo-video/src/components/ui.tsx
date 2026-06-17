import React from 'react';
import { theme } from '../theme';
import { bodyFont, displayFont, monoFont } from '../fonts';

// --- shared chrome + primitives reused across scenes -----------------------

// A macOS-style browser window. Used for the "pain" scene and any app capture.
export const BrowserChrome: React.FC<{
  url: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ url, children, width = 1500, height = 820 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 16,
      overflow: 'hidden',
      background: theme.card,
      boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
      border: `1px solid ${theme.navy[800]}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: bodyFont,
    }}
  >
    <div style={{ height: 44, background: '#e8edf3', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14, borderBottom: `1px solid ${theme.line}` }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
        ))}
      </div>
      <div style={{ flex: 1, height: 26, borderRadius: 13, background: theme.white, border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: theme.inkSoft }}>
        🔒 {url}
      </div>
    </div>
    <div style={{ flex: 1, position: 'relative' }}>{children}</div>
  </div>
);

// The AaykarDesk app frame: logo top bar + a tab strip. `tab` highlights the active one.
export const AppChrome: React.FC<{
  tab?: string;
  caseLabel?: string;
  children: React.ReactNode;
}> = ({ tab, caseLabel, children }) => (
  <div style={{ position: 'absolute', inset: 0, background: theme.cream, display: 'flex', flexDirection: 'column', fontFamily: bodyFont }}>
    <div style={{ height: 58, background: theme.navy[900], display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12 }}>
      <Logo size={22} light />
      {caseLabel && (
        <span style={{ marginLeft: 16, color: theme.inkFaint, fontFamily: monoFont, fontSize: 14 }}>{caseLabel}</span>
      )}
    </div>
    {tab && (
      <div style={{ height: 46, background: theme.card, borderBottom: `1px solid ${theme.line}`, display: 'flex', alignItems: 'stretch', padding: '0 24px', gap: 26 }}>
        {['Notice', 'Documents', 'Reconciliation', 'Research', 'Response'].map((t) => {
          const active = t === tab;
          return (
            <div key={t} style={{ display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: active ? 700 : 500, color: active ? theme.ink : theme.inkFaint, borderBottom: active ? `2px solid ${theme.navy[700]}` : '2px solid transparent' }}>
              {t}
            </div>
          );
        })}
      </div>
    )}
    <div style={{ flex: 1, position: 'relative', padding: 28 }}>{children}</div>
  </div>
);

// Wordmark. The "AD" monogram + name, matching the app's navy/cream identity.
export const Logo: React.FC<{ size?: number; light?: boolean }> = ({ size = 28, light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: size * 1.4, height: size * 1.4, borderRadius: size * 0.32, background: light ? theme.cream : theme.navy[900], color: light ? theme.navy[900] : theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: displayFont, fontWeight: 700, fontSize: size * 0.8 }}>
      अ
    </div>
    <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: size, color: light ? theme.white : theme.ink, letterSpacing: -0.5 }}>
      AaykarDesk
    </span>
  </div>
);

export const Pill: React.FC<{ color: string; children: React.ReactNode; faint?: boolean }> = ({ color, children, faint }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: faint ? color : theme.white, background: faint ? `${color}22` : color, border: faint ? `1px solid ${color}55` : 'none' }}>
    {children}
  </span>
);

export const Field: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: theme.inkFaint, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 600, color: theme.ink, fontFamily: mono ? monoFont : bodyFont }}>{value}</div>
  </div>
);

export { theme, bodyFont, displayFont, monoFont };
