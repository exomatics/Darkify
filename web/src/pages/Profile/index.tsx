import { useLocalModel } from './model.ts';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useEffect, useRef } from 'react';
import { useUser } from '@/features/auth/authService.ts';
import { Avatar } from '@/components/UI/Avatar';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/UI/input.tsx';
import { Button } from '@/components/UI/button.tsx';
import { toast } from 'sonner';

type UserInfoForm = {
  visible_username: string;
};

export const Profile = () => {
  const { userInfo, updateInfo, updateAvatar } = useLocalModel();
  const { register, reset, handleSubmit } = useForm<UserInfoForm>({ defaultValues: userInfo });
  const { setVisibleUsername, setAvatarUrl } = useUser();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);
    await updateAvatar({ avatar: e.target.files[0] });
    await queryClient.invalidateQueries({ queryKey: ['user-info', 'me'] });

    e.target.value = '';
  };

  return (
    <div>
      <div className="inline-flex mt-5" onClick={() => fileInputRef.current?.click()}>
        <Avatar src={userInfo?.avatar_url} size={100} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onAvatarChange}
        />
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
