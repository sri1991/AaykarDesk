// Fonts are bundled LOCALLY via @fontsource so nothing is fetched from
// fonts.gstatic.com at render time. (In sandboxed/proxied environments the
// proxy's TLS cert is untrusted inside headless Chrome, so a network font
// fetch fails the render — local bundling sidesteps that entirely.)
//
// These three variable families match the real AaykarDesk app
// (tailwind.config.js). The original handoff said "Inter" — that was wrong.
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/jetbrains-mono';
import { continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';

export const bodyFont = "'DM Sans Variable', system-ui, sans-serif";
export const displayFont = "'Source Serif 4 Variable', Georgia, serif";
export const monoFont = "'JetBrains Mono Variable', monospace";

const FAMILIES = ['DM Sans Variable', 'Source Serif 4 Variable', 'JetBrains Mono Variable'];

// Blocks Remotion from capturing frames until the @font-face files are parsed
// and ready, so no frame renders with a fallback font.
export const useFontsReady = (): void => {
  const [handle] = useState(() => delayRender('load-fonts'));
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      ...FAMILIES.map((f) => document.fonts.load(`700 16px "${f}"`)),
      ...FAMILIES.map((f) => document.fonts.load(`400 16px "${f}"`)),
    ])
      .then(() => document.fonts.ready)
      .then(() => {
        if (!cancelled) continueRender(handle);
      })
      .catch(() => {
        if (!cancelled) continueRender(handle); // never hang the render on a font miss
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);
};
