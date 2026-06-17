import { interpolate, useCurrentFrame } from 'remotion';

// ONE cursor for the whole film (handoff gotcha #4). Driven by absolute-frame
// waypoints so movement is continuous across scene cuts and never feels
// disconnected. Each waypoint is [absoluteFrame, x, y] in 1920x1080 space.
export type Waypoint = [number, number, number];

// Default path: hovers the upload zone (~f230), drags the PDF (~f260),
// rests over the magic-link button (~f960), taps the Taxmann link (~f1800),
// then parks bottom-right for the dashboard/end card.
export const defaultCursorPath: Waypoint[] = [
  [0, 960, 1040],
  [210, 960, 560],
  [235, 760, 480],
  [265, 760, 560],
  [300, 1100, 700],
  [840, 1200, 520],
  [960, 1180, 760],
  [1080, 1400, 600],
  [1680, 1180, 720],
  [1800, 1180, 820],
  [1980, 1500, 900],
  [2700, 1500, 980],
];

const hideAfter = 2220; // park off-stage during the end card

export const Cursor: React.FC<{ path?: Waypoint[] }> = ({ path = defaultCursorPath }) => {
  const frame = useCurrentFrame();
  if (frame >= hideAfter) return null;

  const frames = path.map((p) => p[0]);
  const x = interpolate(frame, frames, path.map((p) => p[1]), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, frames, path.map((p) => p[2]), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 24 24"
      style={{ position: 'absolute', left: x, top: y, zIndex: 9999, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))' }}
    >
      <path d="M5 3l14 8-6 1.5 3.5 6L13 20l-3.5-6L5 18V3z" fill="#ffffff" stroke="#0A0A0A" strokeWidth={1.2} />
    </svg>
  );
};
