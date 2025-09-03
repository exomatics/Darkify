import { useEffect, useRef } from 'react';
import { useAudioStore } from './store.ts';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { initAudioElement, setCurrentTime, setIsPlaying } = useAudioStore();

  useEffect(() => {
    if (audioRef.current) {
      initAudioElement(audioRef.current);
    }
  }, [initAudioElement]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      crossOrigin="anonymous"
      onTimeUpdate={handleTimeUpdate}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  );
};

export default AudioPlayer;
