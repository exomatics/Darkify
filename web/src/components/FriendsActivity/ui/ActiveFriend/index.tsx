import mockAvatar from './mock.jpg';
import { Icons } from '../../../UI/Icons';
import { Avatar } from '../../../UI/Avatar';

export const ActiveFriend = () => {
  return (
    <div className="flex gap-3">
      <Avatar size={40} src={mockAvatar} />
      <div className="leading-none flex gap-2 flex-col justify-center">
        <span className="text-small">MirRom</span>
        <div className="flex gap-3 items-center">
          <div className="w-3 h-3">
            <Icons.Big.Playing />
          </div>
          <span className="text-sub">In The End</span>
          <div className="w-1 h-1 bg-fg-secondary rounded-full mt-[2px]"></div>
          <span className="text-fg-secondary terxt-sub">Linking Park</span>
        </div>
      </div>
    </div>
  );
};
