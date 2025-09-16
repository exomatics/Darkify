import { useLocalModel } from './model.ts';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../../features/auth/authService.ts';
import { Avatar } from '../../components/UI/Avatar';
import { useQueryClient } from '@tanstack/react-query';

type UserInfoForm = {
  visible_username: string;
};

export const Profile = () => {
  const { userInfo, updateInfo, updateAvatar } = useLocalModel();
  const { register, reset, handleSubmit } = useForm<UserInfoForm>({ defaultValues: userInfo });
  const navigate = useNavigate();
  const { setVisibleUsername, setAvatarUrl } = useUser();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    reset(userInfo);
  }, [reset, userInfo]);

  useEffect(() => {
    setAvatarUrl(userInfo?.avatar_url ?? '');
  }, [setAvatarUrl, userInfo?.avatar_url]);

  const onSubmit: SubmitHandler<UserInfoForm> = (data) => {
    setVisibleUsername(data.visible_username);
    updateInfo(data).then(() => void 0);
    navigate('/');
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
          <label className="block font-bold text-sub mb-2" htmlFor="visible_username">
            Your Visible Name
          </label>
          <input
            className="text-base bg-transparent p-3 rounded-md shadow-sm border border-fg-secondary text-fg-primary outline-none w-full"
            id="visible_username"
            {...register('visible_username')}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button
            className="bg-primary text-bg-primary border-none font-bold text-base py-3 px-6 rounded-full cursor-pointer"
            type="submit"
          >
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
};
