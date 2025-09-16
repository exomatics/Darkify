import { useUser } from '../../features/auth/authService.ts';
import { Avatar } from '../UI/Avatar';
import { useNavigate } from 'react-router';

export const ProfileCard = ({ onClick }: { onClick: () => void }) => {
  const { avatarUrl, visibleUsername, logout } = useUser();
  const navigate = useNavigate();

  return (
    <div className="p-2 flex flex-col items-center">
      <Avatar size={64} src={avatarUrl} />
      <div className="mt-3 text-xl font-medium">{visibleUsername ?? 'Your Name'}</div>
      <div className="mt-3 self-stretch">
        <div
          className="p-3 w-full rounded-md cursor-pointer transition-colors hover:bg-bg-primary text-left"
          onClick={() => {
            navigate('/profile');
            onClick();
          }}
        >
          Profile
        </div>
        <div
          onClick={() => {
            navigate('/settings');
            onClick();
          }}
          className="p-3 w-full rounded-md cursor-pointer transition-colors hover:bg-bg-primary text-left"
        >
          Settings
        </div>
        <div
          onClick={logout}
          className="p-3 w-full rounded-md cursor-pointer transition-colors hover:bg-bg-primary text-left"
        >
          Log Out
        </div>
      </div>
    </div>
  );
};
