import { PlayButton } from '../UI/PlayButton';
import { IconButton } from '../UI/IconButton';
import { PlayRange } from '../UI/PlayRange';
import { CurrentTrack } from './ui/CurrentTrack';
import djIcon from './assets/dj.png';
import AudioPlayer from '../../features/hls-stream/Player.tsx';
import { useAudioStore } from '../../features/hls-stream/store.ts';
import { formatDuration } from '../Track/lib.ts';
import clsx from 'clsx';

export const Playbar = () => {
  const { currentTrack, currentTime, duration, isPlaying, togglePlayPause, seekTo } =
    useAudioStore();

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = currentTime / duration;

  return (
    <div
      style={{ gridArea: 'playbar' }}
      className={clsx(
        isPlaying ? 'bg-bg-playbar' : 'bg-bg-secondary',
        'mt-1 rounded-xl px-5 flex items-center transition-colors',
      )}
    >
      <AudioPlayer />
      <PlayButton onClick={() => togglePlayPause()} played={isPlaying} />
      <div className="flex gap-3 ml-3">
        <IconButton
          icon="Prev"
          onClick={() => {
            console.log('prev');
          }}
        />
        <IconButton icon="Next" onClick={() => console.log('next')} />
        <IconButton icon="Shuffle" iconScale={1.6} onClick={() => console.log('shuffle')} />
        <IconButton icon="Loop" iconScale={1.6} onClick={() => console.log('loop')} />
      </div>
      <PlayRange
        className="ml-2 mr-2"
        onSeek={(percent) => seekTo(percent * duration)}
        currentPercent={progressPercent}
        currentTime={currentTime ? formatTime(currentTime) : ''}
        totalTime={currentTrack?.duration ? formatDuration(currentTrack?.duration) : ''}
      />
      <IconButton icon="Sound" iconScale={1.8} onClick={() => console.log('sound')} />
      <CurrentTrack className="ml-7" currentTrack={currentTrack} />
      <div className="ml-auto flex gap-3 items-center">
        <IconButton
          className="text-fg-secondary"
          icon="Like"
          iconScale={3.2}
          onClick={() => console.log('like')}
        />
        <IconButton
          className="text-fg-secondary"
          icon="AddToPlaylist"
          iconScale={1.6}
          onClick={() => console.log('lyrics')}
        />
        <IconButton
          className="text-fg-secondary"
          icon="Lyrics"
          iconScale={1.6}
          onClick={() => console.log('lyrics')}
        />
        <IconButton
          className="text-fg-secondary"
          icon="More"
          iconScale={1.6}
          onClick={() => console.log('more')}
        />
        <div className="bg-[#89898933] h-9 w-[2px]" />
        <div className="w-8 h-8">
          <img src={djIcon} />
        </div>
        <IconButton icon="Queue" iconScale={1.6} onClick={() => console.log('queue')} />
      </div>
    </div>
  );
};
