import styled from 'styled-components';
import { IconButton } from '../../../UI/IconButton';
import { Avatar } from '../../../UI/Avatar';
import { useAuth } from '../../../../features/auth/authService.ts';
import { Dropdown } from '../../../UI/Dropdown';
import { useRef, useState } from 'react';
import { ProfileCard } from '../../../ProfileCard';

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
  const userInfo = useAuth();
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isVisibleProfileDropdown, setIsVisibleProfileDropdown] = useState(false);

  return (
    <StyledActions>
      <IconButton icon="Notifications" onClick={() => {}} />
      <IconButton icon="Lock" onClick={() => {}} />
      <IconButton className="friends" icon="Friends" onClick={() => {}} />
      <IconButton icon="Settings" onClick={() => {}} />
      <div ref={avatarRef} onClick={() => setIsVisibleProfileDropdown(true)}>
        <Avatar size={32} src={userInfo.currentUser?.avatar_url ?? ''} />
      </div>
      <Dropdown
        width="300px"
        height="auto"
        anchorRef={avatarRef}
        visible={isVisibleProfileDropdown}
        setVisible={setIsVisibleProfileDropdown}
        offsetOptions={{ mainAxis: 10, crossAxis: -135 }}
      >
        <ProfileCard />
      </Dropdown>
    </StyledActions>
  );
};
