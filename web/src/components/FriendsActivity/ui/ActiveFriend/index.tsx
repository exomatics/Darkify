import styled from 'styled-components';
import mockAvatar from './mock.jpg';
import { TextSmall, TextSub } from '../../../UI/Text';
import { Icons } from '../../../UI/Icons';

const StyledActiveFriend = styled.div`
  display: flex;
  gap: 12px;
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 100%;
  }
  .info {
    line-height: 1;
    display: flex;
    gap: 5px;
    flex-direction: column;
    justify-content: center;
  }
  .music {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .playing-icon {
    width: 10px;
  }
  .artist-title {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
  .dot {
    width: 3px;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.fg.secondary};
    border-radius: 100%;
    margin-top: 2px;
  }
`;

export const ActiveFriend = () => {
  return (
    <StyledActiveFriend>
      <img className="avatar" src={mockAvatar} />
      <div className="info">
        <TextSmall>MirRom</TextSmall>
        <div className="music">
          <div className="playing-icon">
            <Icons.Big.Playing />
          </div>
          <TextSub>In The End</TextSub>
          <div className="dot"></div>
          <TextSub className="artist-title">Linking Park</TextSub>
        </div>
      </div>
    </StyledActiveFriend>
  );
};
