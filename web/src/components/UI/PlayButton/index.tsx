import styled from 'styled-components';
import { Icons } from '../Icons';

const StyledPlayButton = styled.button`
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  svg {
    width: 38px;
    height: 38px;
  }
`;

export const PlayButton = ({ played, onClick }: { played: boolean; onClick: () => void }) => {
  return (
    <StyledPlayButton onClick={onClick}>
      {played ? <Icons.Big.Pause /> : <Icons.Big.Play />}
    </StyledPlayButton>
  );
};
