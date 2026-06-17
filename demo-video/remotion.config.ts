import { Config } from '@remotion/cli/config';

// Render defaults. The render script also passes these on the CLI so they win
// even if this file is bypassed.
Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
