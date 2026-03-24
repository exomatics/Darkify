import { IconButton } from '../../../UI/IconButton';
import { Avatar } from '../../../UI/Avatar';
import { ProfileCard } from '../../../ProfileCard';
import { useUserStore } from '@/features/auth/useUserStore.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover.tsx';
import * as RadixPopover from '@radix-ui/react-popover';

export const Actions = () => {
  const avatarUrl = useUserStore((store) => store.currentUser?.avatar_url);

  return (
    <div className="ml-auto flex items-center gap-3">
      <IconButton
        className="text-fg-secondary"
        iconScale={1.5}
        icon="Settings"
        onClick={() => {}}
      />
      <Popover>
        <PopoverTrigger>
          <Avatar size={32} src={avatarUrl ?? ''} />
        </PopoverTrigger>
        <PopoverContent>
          <RadixPopover.Close className="w-full">
            <ProfileCard />
          </RadixPopover.Close>
        </PopoverContent>
      </Popover>
    </div>
  );
};
