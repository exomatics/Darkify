import { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select.tsx';
import { api } from '@/api/api.ts';
import { Switch } from '@/components/UI/switch.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bitrate, UserSettings } from '@/api/gen';
import { toast } from 'sonner';

export const Settings = () => {
  const queryClient = useQueryClient();
  const currentSettings = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.user.getUsersMeSettings(),
  });
  const { mutateAsync: updateBitrate } = useMutation({
    mutationFn: (bitrate: Bitrate) => api.user.putUsersMeSettings({ bitrate }),
    onMutate: async (newBitrate) => {
      await queryClient.cancelQueries({ queryKey: ['settings'] });
      const previousSettings = queryClient.getQueryData(['settings']);
      queryClient.setQueryData(['settings'], (old: UserSettings) => ({
        ...old,
        bitrate: newBitrate,
      }));

      return { previousSettings };
    },
    onError: (_, __, context) => {
      toast.error('Failed to update settings');
      if (context?.previousSettings) {
        queryClient.setQueryData(['settings'], context.previousSettings);
      }
    },
  });
  console.log(currentSettings.data?.bitrate);
  return (
    <div className="w-[700px] mx-auto">
      <h1 className="text-3xl font-semibold mb-10">Settings</h1>
      <Category>Language</Category>
      <Setting label="Choose language">
        <Select value="english">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="portuguese">Portuguese</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="japanese">Japanese</SelectItem>
          </SelectContent>
        </Select>
      </Setting>
      <Category>Audio quality</Category>
      <Setting label="Streaming quality">
        <Select onValueChange={updateBitrate} value={currentSettings?.data?.bitrate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Bitrate.AUTO}>Automatic</SelectItem>
            <SelectItem value={Bitrate.LOW}>Low</SelectItem>
            <SelectItem value={Bitrate.NORMAL}>Normal</SelectItem>
            <SelectItem value={Bitrate.HIGH}>High</SelectItem>
            <SelectItem value={Bitrate.VERY_HIGH}>Very high</SelectItem>
          </SelectContent>
        </Select>
      </Setting>
      <Setting label="Normalize volume">
        <Switch />
      </Setting>
      <Category>Playback</Category>
      <Setting label="Crossfade songs">
        <Switch />
      </Setting>
      <Setting label="Automix">
        <Switch />
      </Setting>
      <Setting label="Mono audio">
        <Switch />
      </Setting>
      <Setting label="Equalizer">
        <Switch />
      </Setting>
    </div>
  );
};

const Category = ({ children }: { children: ReactNode }) => (
  <h1 className="text-xl font-medium mt-5">{children}</h1>
);

const Setting = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="flex justify-between items-center mt-3">
    <span className="text-fg-secondary ">{label}</span>
    {children}
  </div>
);
