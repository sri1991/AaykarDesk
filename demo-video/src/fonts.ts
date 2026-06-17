// The real app uses DM Sans (body), Source Serif 4 (display) and JetBrains Mono.
// NOTE: the original handoff asset list said "Inter" — that was wrong; these
// three match AaykarDesk's tailwind.config.js. Loaded via @remotion/google-fonts
// so no local woff2 files are needed (public/fonts/ is now optional).
import { loadFont as loadBody } from '@remotion/google-fonts/DMSans';
import { loadFont as loadDisplay } from '@remotion/google-fonts/SourceSerif4';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

export const { fontFamily: bodyFont } = loadBody();
export const { fontFamily: displayFont } = loadDisplay();
export const { fontFamily: monoFont } = loadMono();
