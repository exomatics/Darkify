import styled from 'styled-components';
import { TextSmall } from '../Text';

const StyledPlayRange = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;

  .range {
    width: 317px;
    height: 3px;
    border-radius: 3px;
    background: rgba(137, 137, 137, 0.27);
    cursor: pointer;
    .passed {
      width: 50%;
      background-color: ${({ theme }) => theme.colors.fg.primary};
      height: 3px;
      border-radius: 3px;
    }
  }
  .time {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
`;

export const PlayRange = ({
  currentPercent,
  currentTime,
  totalTime,
}: {
  currentPercent: number;
  currentTime: string;
  totalTime: string;
}) => {
  return (
    <StyledPlayRange className="play-range">
      <TextSmall className="time">{currentTime}</TextSmall>
      <div className="range">
        <div className="passed" style={{ width: currentPercent * 100 + '%' }}></div>
      </div>
      <TextSmall className="time">{totalTime}</TextSmall>
    </StyledPlayRange>
  );
};
