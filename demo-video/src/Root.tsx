import { Composition } from 'remotion';
import { AaykarDeskDemo } from './AaykarDeskDemo';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AaykarDeskDemo"
    component={AaykarDeskDemo}
    durationInFrames={2700}
    fps={30}
    width={1920}
    height={1080}
  />
);
