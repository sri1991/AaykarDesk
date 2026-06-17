import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Frames here are LOCAL to the enclosing <Sequence> (Remotion resets the frame
// counter per sequence), so scenes can always reason from 0.

export const useFadeIn = (startFrame = 0, duration = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const useSlideIn = (startFrame = 0, fromX = -20) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 100 } });
  return fromX * (1 - progress);
};

// Spring-driven scale for "pop" entrances (cards, badges).
export const usePop = (startFrame = 0, from = 0.85) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
  return from + (1 - from) * progress;
};

// Symmetric fade: in over `inDur`, hold, out over `outDur` before the scene ends.
export const useFadeInOut = (durationInFrames: number, inDur = 12, outDur = 12) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, inDur, durationInFrames - outDur, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
};

// Count-up that ALWAYS returns an integer. Gotcha #5 from the handoff:
// interpolate yields floats (13.7) that look broken on a stat counter.
export const useCountUp = (target: number, startFrame = 0, duration = 30) => {
  const frame = useCurrentFrame();
  const raw = interpolate(frame, [startFrame, startFrame + duration], [0, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.round(raw);
};
