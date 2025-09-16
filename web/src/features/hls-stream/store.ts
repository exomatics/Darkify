import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Hls from 'hls.js';
import { TrackInfo } from '@/api/gen';
import { api } from '@/api/api.ts';
import { getHLSConfig, processHLSContent, setupHLSLogging, timeToSeconds } from './lib.ts';

type AudioStore = {
  currentTrack: TrackInfo | null;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;

  hls: Hls | null;
  audioElement: HTMLAudioElement | null;

  queue: TrackInfo[];
  currentIndex: number;

  setCurrentTrack: (track: TrackInfo | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  initAudioElement: (element: HTMLAudioElement) => void;
  playTrack: (trackId: string) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: TrackInfo) => void;
  setQueue: (tracks: TrackInfo[], startIndex?: number) => void;
  clearQueue: () => void;
  cleanup: () => void;
};

export const useAudioStore = create(
  subscribeWithSelector<AudioStore>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isMuted: false,

    hls: null,
    audioElement: null,

    queue: [],
    currentIndex: 0,

    setCurrentTrack: (track: TrackInfo | null) => set({ currentTrack: track }),

    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

    setIsLoading: (isLoading: boolean) => set({ isLoading }),

    setDuration: (duration: number) => set({ duration }),

    setCurrentTime: (currentTime: number) => set({ currentTime }),

    setVolume: (volume: number) => {
      const { audioElement } = get();
      set({ volume });
      if (audioElement) {
        audioElement.volume = volume;
      }
    },

    setMuted: (isMuted: boolean) => {
      const { audioElement } = get();
      set({ isMuted });
      if (audioElement) {
        audioElement.muted = isMuted;
      }
    },

    initAudioElement: (element: HTMLAudioElement) => {
      set({ audioElement: element });
    },

    playTrack: async (trackId) => {
      const state = get();

      try {
        set({ isLoading: true });

        const trackInfo = await api.track.getTracks(trackId);
        const m3u8Content = await api.track.getTracksStream(trackId);
        set({ duration: timeToSeconds(trackInfo?.duration ?? '') });

        const processedHlsContent = processHLSContent(String(m3u8Content));

        set({ currentTrack: trackInfo });

        if (state.hls) {
          state.hls.destroy();
        }

        const hlsBlob = new Blob([processedHlsContent], { type: 'application/vnd.apple.mpegurl' });
        const hlsUrl = URL.createObjectURL(hlsBlob);

        if (Hls.isSupported() && state.audioElement) {
          const hls = new Hls(getHLSConfig());

          setupHLSLogging(hls);

          hls.loadSource(hlsUrl);
          hls.attachMedia(state.audioElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            set({ isLoading: false });
            state.audioElement?.play().catch(console.error);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Fatal network error encountered, try to recover');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Fatal media error encountered, try to recover');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('Fatal error, cannot recover');
                  hls.destroy();
                  break;
              }
            }
            set({ isLoading: false });
          });

          set({ hls });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            URL.revokeObjectURL(hlsUrl);
          });
        }
      } catch (error) {
        console.error('Error playing track:', error);
        set({ isLoading: false });
      }
    },

    togglePlayPause: () => {
      const { audioElement, isPlaying } = get();

      if (!audioElement) return;

      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(console.error);
      }
    },

    seekTo: (time: number) => {
      const { audioElement } = get();
      if (audioElement && !isNaN(time)) {
        audioElement.currentTime = time;
        set({ currentTime: time });
      }
    },

    nextTrack: () => {
      const { queue, currentIndex } = get();
      const nextIndex = currentIndex + 1;

      if (nextIndex < queue.length) {
        set({ currentIndex: nextIndex });
        get().playTrack(queue[nextIndex].id);
      }
    },

    previousTrack: () => {
      const { queue, currentIndex } = get();
      const prevIndex = currentIndex - 1;

      if (prevIndex >= 0) {
        set({ currentIndex: prevIndex });
        get().playTrack(queue[prevIndex].id);
      } else {
        get().seekTo(0);
      }
    },

    addToQueue: (track: Track) => {
      const { queue } = get();
      set({ queue: [...queue, track] });
    },

    setQueue: (tracks: Track[], startIndex = 0) => {
      set({
        queue: tracks,
        currentIndex: startIndex,
      });
    },

    clearQueue: () => {
      set({ queue: [], currentIndex: 0 });
    },

    cleanup: () => {
      const { hls, audioElement } = get();

      if (hls) {
        hls.destroy();
      }

      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
      }

      set({
        hls: null,
        currentTrack: null,
        isPlaying: false,
        isLoading: false,
        duration: 0,
        currentTime: 0,
      });
    },
  })),
);
