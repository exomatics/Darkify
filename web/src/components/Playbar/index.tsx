import { PlayButton } from '../UI/PlayButton';
import { StyledPlaybar } from './styles';
import { IconButton } from '../UI/IconButton';
import { PlayRange } from '../UI/PlayRange';
import { CurrentTrack } from './ui/CurrentTrack';
import djIcon from './assets/dj.png';
import AudioPlayer from '../../features/hls-stream/Player.tsx';
import { useAudioStore } from '../../features/hls-stream/store.ts';
import { formatDuration } from '../Track/lib.ts';

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
    <StyledPlaybar>
      <AudioPlayer />
      <PlayButton onClick={() => togglePlayPause()} played={isPlaying} />
      <div className="left-actions">
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
        onSeek={(percent) => seekTo(percent * duration)}
        currentPercent={progressPercent}
        currentTime={currentTime ? formatTime(currentTime) : ''}
        totalTime={currentTrack?.duration ? formatDuration(currentTrack?.duration) : ''}
      />
      <IconButton icon="Sound" iconScale={1.8} onClick={() => console.log('sound')} />
      <CurrentTrack currentTrack={currentTrack} />
      <div className="right-actions">
        <IconButton icon="Like" iconScale={3.2} onClick={() => console.log('like')} />
        <IconButton icon="AddToPlaylist" iconScale={1.6} onClick={() => console.log('lyrics')} />
        <IconButton icon="Lyrics" iconScale={1.6} onClick={() => console.log('lyrics')} />
        <IconButton icon="More" iconScale={1.6} onClick={() => console.log('more')} />
        <div className="divider" />
        <div className="dj">
          <img src={djIcon} />
        </div>
        <IconButton icon="Queue" iconScale={1.6} onClick={() => console.log('queue')} />
      </div>
    </StyledPlaybar>
  );
};
