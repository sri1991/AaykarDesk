import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Cursor } from './utils/Cursor';
import { useFontsReady } from './fonts';
import { theme } from './theme';

import { InboxHook } from './scenes/01_InboxHook';
import { BrowserTabsPain } from './scenes/02_BrowserTabsPain';
import { NoticeUploadScene } from './scenes/03_NoticeUpload';
import { ExtractionReview } from './scenes/04_ExtractionReview';
import { RegimeBadge } from './scenes/05_RegimeBadge';
import { CaseDetail } from './scenes/06_CaseDetail';
import { DocumentsTab } from './scenes/07_DocumentsTab';
import { SplitScreenPortal } from './scenes/08_SplitScreenPortal';
import { ReconciliationTab } from './scenes/09_Reconciliation';
import { ResearchTab } from './scenes/10_Research';
import { CaseDashboard } from './scenes/11_Dashboard';
import { EndCard } from './scenes/12_EndCard';

// Flip to true once the media in public/ is in place (see public/README.md).
// Kept false so the project renders cleanly with no assets supplied yet.
const ENABLE_AUDIO = false;

// Single source of truth for the timeline. Frame numbers are LOCKED to the
// handoff; change durations here and only here.
const SCENES = [
  { from: 0, dur: 90, Comp: InboxHook, vo: 'vo/01_hook.mp3' },
  { from: 90, dur: 120, Comp: BrowserTabsPain, vo: 'vo/02_pain.mp3' },
  { from: 210, dur: 90, Comp: NoticeUploadScene, vo: 'vo/03_pivot.mp3' },
  { from: 300, dur: 240, Comp: ExtractionReview, vo: 'vo/04_extract.mp3' },
  { from: 540, dur: 120, Comp: RegimeBadge, vo: 'vo/05_regime.mp3' },
  { from: 660, dur: 180, Comp: CaseDetail, vo: 'vo/06_case_created.mp3' },
  { from: 840, dur: 240, Comp: DocumentsTab, vo: 'vo/07_handoff.mp3' },
  { from: 1080, dur: 300, Comp: SplitScreenPortal, vo: 'vo/08_portal.mp3' },
  { from: 1380, dur: 300, Comp: ReconciliationTab, vo: 'vo/09_recon.mp3' },
  { from: 1680, dur: 300, Comp: ResearchTab, vo: 'vo/10_research.mp3' },
  { from: 1980, dur: 240, Comp: CaseDashboard, vo: 'vo/11_dashboard.mp3' },
  { from: 2220, dur: 480, Comp: EndCard, vo: 'vo/12_cta.mp3' },
] as const;

export const AaykarDeskDemo: React.FC = () => {
  useFontsReady(); // hold frames until local fonts are parsed
  return (
  <AbsoluteFill style={{ background: theme.stage }}>
    {/* Background music — full duration, ducked under VO via the volume prop. */}
    {ENABLE_AUDIO && <Audio src={staticFile('audio/bgm.mp3')} volume={0.15} />}

    {SCENES.map(({ from, dur, Comp, vo }) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <Comp />
        {ENABLE_AUDIO && <Audio src={staticFile(vo)} />}
      </Sequence>
    ))}

    {/* One cursor across the whole film, driven by absolute-frame waypoints. */}
    <Cursor />
  </AbsoluteFill>
  );
};
