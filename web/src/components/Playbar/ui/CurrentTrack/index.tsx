import styled from 'styled-components';
import mockCover from './mock.png';
import { TextSub } from '../../../UI/Text';

const StyledCurrentTrack = styled.div`
  display: flex;
  gap: 10px;
  .info {
    display: flex;
    flex-direction: column;
  }
  .track-title {
    color: ${({ theme }) => theme.colors.fg.primary};
  }
  .artist-title,
  .album-title {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
`;

export const CurrentTrack = () => {
  return (
    <StyledCurrentTrack className="current-track-info">
      <img className="cover" src={mockCover} />
      <div className="info">
        <TextSub className="track-title">Get Lucky</TextSub>
        <TextSub className="artist-title">Daft Punk</TextSub>
        <TextSub className="album-title">Random Access Memories</TextSub>
      </div>
    </StyledCurrentTrack>
  );
};
