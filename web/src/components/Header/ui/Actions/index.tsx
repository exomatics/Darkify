import styled from 'styled-components';
import { IconButton } from '../../../UI/IconButton';
import { Avatar } from '../../../UI/Avatar';

const StyledActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 9px;
  .icon-button {
    width: 40px;
    height: 40px;
    svg {
      transform: scale(1.3);
    }
  }
  .friends svg {
    transform: scale(1.6);
  }
`;

export const Actions = () => {
  return (
    <StyledActions>
      <IconButton icon="Notifications" onClick={() => {}} />
      <IconButton icon="Lock" onClick={() => {}} />
      <IconButton className="friends" icon="Friends" onClick={() => {}} />
      <IconButton icon="Settings" onClick={() => {}} />
      <Avatar />
    </StyledActions>
  );
};
