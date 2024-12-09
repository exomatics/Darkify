import styled from 'styled-components';

export const StyledPlaybar = styled.div`
  grid-area: playbar;
  background-color: ${({ theme }) => theme.colors.bg.playbar};
  margin-top: 4px;
  border-radius: 10px;
  padding: 0 21px;
  display: flex;
  align-items: center;
  .left-actions {
    display: flex;
    gap: 10px;
    margin-left: 10px;
  }
  .play-range {
    margin-left: 10px;
    margin-right: 10px;
  }
  .current-track-info {
    margin-left: 26px;
  }
  .right-actions {
    margin-left: auto;
    display: flex;
    gap: 12px;
    align-items: center;
    .divider {
      background-color: rgba(137, 137, 137, 0.3);
      height: 36px;
      width: 2px;
    }
    .dj {
      width: 33px;
      height: 33px;
    }
  }
`;
