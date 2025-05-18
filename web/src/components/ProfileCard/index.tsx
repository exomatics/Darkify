import { useAuth } from '../../features/auth/authService.ts';
import styled from 'styled-components';
import { Avatar } from '../UI/Avatar';

export const ProfileCard = () => {
  const userData = useAuth();

  return (
    <StyledProfileCard>
      <Avatar size={64} src={userData.currentUser?.avatar_url} />
      <div className="visible-username">{userData.currentUser?.visible_username ?? 'Name'}</div>
      <div className="items">
        <div className="item">Profile</div>
        <div className="item">Settings</div>
        <div onClick={userData.logout} className="item">
          Log Out
        </div>
      </div>
    </StyledProfileCard>
  );
};

const StyledProfileCard = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .visible-username {
    margin-top: 10px;
    font-size: 18px;
    font-weight: 500;
  }

  .items {
    margin-top: 10px;
    align-self: stretch;
  }

  .item {
    padding: 10px;
    align-self: stretch;
    width: 100%;
    cursor: pointer;
    transition: 200ms all;

    &:hover {
      background-color: ${({ theme }) => theme.colors.bg.primary};
      border-radius: 5px;
    }
  }
`;
