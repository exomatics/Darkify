import { useLocalModel } from './model.ts';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/features/auth/authService.ts';
import { Avatar } from '@/components/UI/Avatar';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/UI/input.tsx';
import { Button } from '@/components/UI/button.tsx';
import { toast } from 'sonner';
import { Icons } from '@/components/UI/Icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog.tsx';
import { Textarea } from '@/components/UI/textarea.tsx';
import { useUserStore } from '@/features/auth/useUserStore.ts';

type UserInfoForm = {
  visible_username: string;
};

type BecomeArtistForm = {
  description: string;
};

export const Profile = () => {
  const { userInfo, updateInfo, updateAvatar, turnToArtist } = useLocalModel();
  const { register, reset, handleSubmit } = useForm<UserInfoForm>({ defaultValues: userInfo });
  const { setVisibleUsername, setAvatarUrl } = useUser();
  const queryClient = useQueryClient();
  const setCurrentUser = useUserStore((s) => s.setUserData);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);

  const {
    register: registerArtist,
    handleSubmit: handleArtistSubmit,
    reset: resetArtistForm,
  } = useForm<BecomeArtistForm>();

  useEffect(() => {
    reset(userInfo);
  }, [reset, userInfo]);

  useEffect(() => {
    setAvatarUrl(userInfo?.avatar_url ?? '');
  }, [setAvatarUrl, userInfo?.avatar_url]);

  const onSubmit: SubmitHandler<UserInfoForm> = async (data) => {
    setVisibleUsername(data.visible_username);
    try {
      await updateInfo(data);
      toast.success('Successfully updated profile');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    await updateAvatar({ avatar: e.target.files[0] });
    await queryClient.invalidateQueries({ queryKey: ['user-info', 'me'] });
    e.target.value = '';
  };

  const onBecomeArtist: SubmitHandler<BecomeArtistForm> = async (data) => {
    try {
      await turnToArtist({ description: data.description || undefined, banner: bannerFile ?? undefined });
      const refreshed = await queryClient.fetchQuery({
        queryKey: ['user-info', 'me'],
        queryFn: () => import('@/api/api.ts').then((m) => m.api.user.getUsersMe()),
      });
      setCurrentUser(refreshed);
      toast.success('You are now an artist!');
      setArtistDialogOpen(false);
      resetArtistForm();
      setBannerFile(null);
    } catch {
      toast.error('Failed to become an artist');
    }
  };

  return (
    <div>
      <div className="flex items-end gap-4 mt-5">
        <div className="inline-flex cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar src={userInfo?.avatar_url} size={100} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onAvatarChange}
          />
        </div>
        <div className="flex flex-col gap-2 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">{userInfo?.visible_username}</span>
            {userInfo?.is_artist && <ArtistBadge />}
          </div>
          {!userInfo?.is_artist && (
            <Dialog open={artistDialogOpen} onOpenChange={setArtistDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 self-start">
                  <Icons.Big.Artist className="w-4 h-4" />
                  Become an Artist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icons.Big.Artist className="w-5 h-5 text-primary" />
                    Become an Artist
                  </DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2" onSubmit={handleArtistSubmit(onBecomeArtist)}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-fg-secondary">Bio (optional)</label>
                    <Textarea
                      placeholder="Tell listeners about yourself..."
                      rows={4}
                      {...registerArtist('description')}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-fg-secondary">Banner image (optional)</label>
                    <div
                      className="border border-dashed border-bg-secondary rounded-lg p-4 text-center text-fg-secondary text-sm cursor-pointer hover:border-primary transition-colors"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      {bannerFile ? bannerFile.name : 'Click to upload a banner'}
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <DialogClose asChild>
                      <Button variant="ghost" type="button">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Confirm</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <form className="flex flex-col gap-3 mt-10" onSubmit={handleSubmit(onSubmit)}>
        <div className="input-container">
          <Input label="Visible username" {...register('visible_username')} />
        </div>
        <div className="flex justify-end mt-2">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </div>
  );
};

const ArtistBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
    <Icons.Big.Artist className="w-3 h-3" />
    Artist
  </span>
);
