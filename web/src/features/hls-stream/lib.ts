import { BACKEND_BASE } from '../../api/api.ts';

export const processHLSContent = (hlsContent: string): string => {
  return hlsContent.replace(/^\/files\/audio\/.+\.ts$/gm, (match) => `${BACKEND_BASE}${match}`);
};

export const getHLSConfig = () => ({
  enableWorker: true,
  lowLatencyMode: false,
  debug: true,

  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000,
  maxBufferHole: 0.5,

  maxLoadingDelay: 4,
  maxRetryDelay: 64,
  retryDelayOffset: 0.1,
  maxRetry: 3,

  fragLoadingTimeOut: 20000,
  manifestLoadingTimeOut: 10000,
});

export const setupHLSLogging = (hls: any) => {
  hls.on('hlsFragLoading', (event, data) => {
    console.log('Loading fragment:', data.frag.url);
  });

  hls.on('hlsFragLoaded', (event, data) => {
    console.log('Fragment loaded:', data.frag.url);
  });

  hls.on('hlsManifestParsed', () => {
    console.log('HLS manifest parsed successfully');
  });
};

export function timeToSeconds(timeString: string): number {
  const parts = timeString.split(':');

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  const secondsPart = parts[2];
  const [seconds, milliseconds = '0'] = secondsPart.split('.');

  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    parseInt(seconds, 10) +
    parseInt(milliseconds.padEnd(3, '0')) / 1000;

  return totalSeconds;
}
