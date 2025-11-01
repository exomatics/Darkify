import { UserInfo } from '@/api/gen';
import { Avatar } from '@/components/UI/Avatar';

export const UserListItem = ({ userInfo }: { userInfo: UserInfo }) => {
  return (
    <div className="flex items-center gap-2 p-2 hover:bg-bg-primary rounded-md ">
      <Avatar size={35} src={userInfo.avatar_url} />
      <span>{userInfo.visible_username}</span>
    </div>
  );
};
