import { IconButton } from '../../../UI/IconButton';
import { Avatar } from '../../../UI/Avatar';
import { Dropdown } from '../../../UI/Dropdown';
import { useRef, useState } from 'react';
import { ProfileCard } from '../../../ProfileCard';
import { useUserStore } from '../../../../features/auth/useUserStore.ts';

export const Actions = () => {
  const avatarUrl = useUserStore((store) => store.currentUser?.avatar_url);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isVisibleProfileDropdown, setIsVisibleProfileDropdown] = useState(false);

  return (
    <div className="ml-auto flex items-center gap-3">
      <IconButton iconScale={1.5} icon="Notifications" onClick={() => {}} />
      <IconButton iconScale={1.5} icon="Lock" onClick={() => {}} />
      <IconButton iconScale={1.8} className="friends" icon="Friends" onClick={() => {}} />
      <IconButton iconScale={1.5} icon="Settings" onClick={() => {}} />
      <div ref={avatarRef} onClick={() => setIsVisibleProfileDropdown(true)}>
        <Avatar size={32} src={avatarUrl ?? ''} />
      </div>
      <Dropdown
        width="300px"
        height="auto"
        anchorRef={avatarRef}
        visible={isVisibleProfileDropdown}
        setVisible={setIsVisibleProfileDropdown}
        offsetOptions={{ mainAxis: 10, crossAxis: -135 }}
      >
        <ProfileCard onClick={() => setIsVisibleProfileDropdown(false)} />
      </Dropdown>
    </div>
  );
};
