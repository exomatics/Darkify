import { useUser } from '../../features/auth/authService.ts';
import styled from 'styled-components';
import { Avatar } from '../UI/Avatar';
import { useNavigate } from 'react-router';

export const ProfileCard = ({ onClick }: { onClick: () => void }) => {
  const { avatarUrl, visibleUsername, logout } = useUser();
  const navigate = useNavigate();

  return (
    <StyledProfileCard>
      <Avatar size={64} src={avatarUrl} />
      <div className="visible-username">{visibleUsername ?? 'Your Name'}</div>
      <div className="items">
        <div
          className="item"
          onClick={() => {
            navigate('/profile');
            onClick();
          }}
        >
          Profile
        </div>
        <div className="item">Settings</div>
        <div onClick={logout} className="item">
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
