import { PlayButton } from '../UI/PlayButton';
import { IconButton } from '../UI/IconButton';
import { PlayRange } from '../UI/PlayRange';
import { CurrentTrack } from './ui/CurrentTrack';
import djIcon from './assets/dj.png';
import AudioPlayer from '../../features/hls-stream/Player.tsx';
import { LoopMode, useAudioStore } from '../../features/hls-stream/store.ts';
import { formatDuration } from '../Track/lib.ts';
import clsx from 'clsx';
import { Toggle } from '@/components/UI/toggle.tsx';
import { Icons } from '@/components/UI/Icons';

export const Playbar = () => {
  const {
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    togglePlayPause,
    seekTo,
    nextTrack,
    loopMode,
    setLoopMode,
  } = useAudioStore();

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  console.log(loopMode);
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
        <Toggle onClick={() => nextTrack()} className="scale-110" pressed={false}>
          <Icons.Big.Prev className="scale-90" />
        </Toggle>
        <Toggle onClick={() => nextTrack()} className="scale-110" pressed={false}>
          <Icons.Big.Next className="scale-90" />
        </Toggle>
        <Toggle className="scale-110" pressed={false}>
          <Icons.Big.Shuffle />
        </Toggle>
        <Toggle
          className="scale-110"
          onPressedChange={(value) => {
            console.log('123', value);
            return value ? setLoopMode(LoopMode.LoopOne) : setLoopMode(LoopMode.NoLoop);
          }}
          pressed={loopMode === LoopMode.LoopOne}
        >
          <Icons.Big.Loop />
        </Toggle>
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
