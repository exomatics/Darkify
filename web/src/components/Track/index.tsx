import styled from 'styled-components';
import { TrackInfo } from '../../api/gen';
import { BACKEND_BASE } from '../../api/api.ts';
import { formatDuration } from './lib.ts';
import { Icons } from '../UI/Icons';

export const Track = ({
  number,
  track,
  onPlay,
}: {
  number: number;
  track: TrackInfo;
  onPlay?: () => void;
}) => {
  return (
    <StyledTrack>
      <div onClick={onPlay} className="number">
        <div className="no-icon">{number}</div>
        <div className="icon">
          <Icons.Big.PlayOnly />
        </div>
      </div>
      <img src={BACKEND_BASE + track.cover_url} alt="" className="cover" />
      <div className="info">
        <div className="title">{track.name}</div>
        <div className="artists">
          {track.artists?.map((artist) => <div className="artist">{artist.visible_username}</div>)}
        </div>
      </div>
      <div className="album">Album Name</div>
      <div className="duration">{formatDuration(track.duration)}</div>
    </StyledTrack>
  );
};

const StyledTrack = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  height: 71px;
  border-radius: 6px;
  padding-left: 15px;
  .no-icon {
    display: block;
  }
  .icon {
    display: none;
    justify-content: center;
    align-items: center;
    width: 14px;
    height: auto;
    cursor: pointer;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.bg.primary};
    .no-icon {
      display: none;
    }
    .icon {
      display: flex;
    }
  }

  .number {
    width: 42px;
    height: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({ theme }) => theme.colors.fg.secondary};
  }

  .cover {
    width: 51px;
    height: 51px;
    border-radius: 3px;
  }

  .info {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    width: 400px;
  }

  .artist {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.fg.secondary};
  }

  .album {
    color: ${({ theme }) => theme.colors.fg.secondary};
    width: 300px;
  }

  .duration {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
`;
