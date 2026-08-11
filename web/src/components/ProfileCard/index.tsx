import { useUser } from '@/features/auth/authService.ts';
import { Avatar } from '../UI/Avatar';
import { useNavigate } from 'react-router';
import { useUserStore } from '@/features/auth/useUserStore.ts';
import { Upload } from 'lucide-react';

export const ProfileCard = () => {
  const { avatarUrl, visibleUsername, logout } = useUser();
  const currentUser = useUserStore((store) => store.currentUser);
  const navigate = useNavigate();

  return (
    <div className="p-2 flex flex-col items-center">
      <Avatar size={64} src={avatarUrl} />
      <div className="mt-3 text-xl font-medium">{visibleUsername ?? 'Your Name'}</div>
      <div className="mt-3 self-stretch">
        {currentUser?.is_artist && (
          <div
            className="flex items-center justify-center gap-2 p-3 w-full rounded-md cursor-pointer transition-colors hover:bg-bg-primary text-left text-primary border border-primary"
            onClick={() => {
              navigate('/upload');
            }}
          >
            <Upload />
            Upload a new track
          </div>
        )}
        <div
          className="p-3 w-full rounded-md cursor-pointer transition-colors hover:bg-bg-primary text-left"
          onClick={() => {
            navigate('/profile');
          }}
        >
          Profile
        </div>
        <div
          onClick={() => {
            navigate('/settings');
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
