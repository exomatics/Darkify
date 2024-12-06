import { useState } from 'react';
import { PlayButton } from '../UI/PlayButton';
import { StyledPlaybar } from './styles';
import { IconButton } from '../UI/IconButton';
import { PlayRange } from '../UI/PlayRange';
import { CurrentTrack } from './ui/CurrentTrack';
import djIcon from './assets/dj.png';

export const Playbar = () => {
  const [isPlayed, setIsPlayed] = useState(false);
  return (
    <StyledPlaybar>
      <PlayButton onClick={() => setIsPlayed(!isPlayed)} played={isPlayed} />
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
      <PlayRange currentPercent={0.4} currentTime="0:40" totalTime="1:00" />
      <IconButton icon="Sound" iconScale={1.8} onClick={() => console.log('sound')} />
      <CurrentTrack />
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
