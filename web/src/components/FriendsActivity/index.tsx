import { IconButton } from '../UI/IconButton';
import { ActiveFriend } from './ui/ActiveFriend';

export const FriendsActivity = () => {
  return (
    <div
      className="border border-bg-secondary rounded-xl mt-1 ml-2 p-5"
      style={{ gridArea: 'right-sidebar' }}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-base">Friends Activity</div>
        <div className="flex gap-4">
          <IconButton icon="AddFriend" iconScale={1.6} onClick={() => console.log('add friend')} />
          <IconButton icon="Close" iconScale={1.3} onClick={() => console.log('close')} />
        </div>
      </div>
      <div className="mt-11 flex flex-col gap-8">
        <ActiveFriend />
        <ActiveFriend />
        <ActiveFriend />
        <ActiveFriend />
      </div>
    </div>
  );
};
