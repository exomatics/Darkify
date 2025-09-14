import styled from 'styled-components';
import { TextSub } from '../../../UI/Text';
import { TrackInfo } from '../../../../api/gen';
import { BACKEND_BASE } from '../../../../api/api.ts';

const StyledCurrentTrack = styled.div`
  display: flex;
  gap: 10px;
  .info {
    display: flex;
    flex-direction: column;
    line-height: 1;
    justify-content: space-between;
  }
  .cover {
    width: 51px;
    height: 51px;
    border-radius: 6px;
  }
  .track-title {
    color: ${({ theme }) => theme.colors.fg.primary};
  }
  .artist-title,
  .album-title {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
`;

export const CurrentTrack = ({ currentTrack }: { currentTrack: TrackInfo | null }) => {
  return (
    <StyledCurrentTrack className="current-track-info">
      <img className="cover" src={BACKEND_BASE + currentTrack?.cover_url} />
      <div className="info">
        <TextSub className="track-title">{currentTrack?.name ?? ''}</TextSub>
        <TextSub className="artist-title">
          {currentTrack?.artists?.map((artist) => artist.visible_username)}
        </TextSub>
        <TextSub className="album-title">Album Name</TextSub>
      </div>
    </StyledCurrentTrack>
  );
};
