import { IconButton } from '../UI/IconButton';
import { StyledFriendsActivity } from './styles';
import { ActiveFriend } from './ui/ActiveFriend';

export const FriendsActivity = () => {
  return (
    <StyledFriendsActivity>
      <div className="header">
        <div className="title">Friends Activity</div>
        <div className="actions">
          <IconButton icon="AddFriend" iconScale={1.6} onClick={() => console.log('add friend')} />
          <IconButton icon="Close" iconScale={1.3} onClick={() => console.log('close')} />
        </div>
      </div>
      <div className="active-friends">
        <ActiveFriend />
        <ActiveFriend />
        <ActiveFriend />
        <ActiveFriend />
      </div>
    </StyledFriendsActivity>
  );
};
