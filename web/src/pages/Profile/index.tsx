import styled from 'styled-components';
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
  }, [userInfo?.avatar_url]);

  const onSubmit: SubmitHandler<UserInfoForm> = (data) => {
    setVisibleUsername(data.visible_username);
    updateInfo(data).then(() => void 0);
    navigate('/');
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);
    await updateAvatar(formData);
    await queryClient.invalidateQueries({ queryKey: ['user-info', 'me'] });

    e.target.value = '';
  };

  return (
    <StyledProfilePage>
      <h1>Edit profile</h1>
      <AvatarWrapper onClick={() => fileInputRef.current?.click()}>
        <Avatar src={userInfo?.avatar_url} size={100} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onAvatarChange}
        />
      </AvatarWrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-container">
          <label htmlFor="visible_username">Your Visible Name</label>
          <input id="visible_username" {...register('visible_username')} />
        </div>
        <div className="button-container">
          <button className="submit" type="submit">
            Save profile
          </button>
        </div>
      </form>
    </StyledProfilePage>
  );
};

const StyledProfilePage = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    display: block;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 8px;
  }

  input {
    font-size: 16px;
    font-weight: 400;
    background: transparent;
    padding: 12px;
    border-radius: 4px;
    border: 0;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.fg.secondary};
    color: ${({ theme }) => theme.colors.fg.primary};
    outline: none;
    width: 100%;
  }

  .submit {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.bg.primary};
    border: 0;
    font-weight: 700;
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 100vw;
    cursor: pointer;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  form {
    margin-top: 40px;
  }
`;

const AvatarWrapper = styled.div`
  display: inline-flex;
  margin-top: 20px;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 100vw;
    cursor: pointer;
    object-fit: cover;
    border: 2px solid ${({ theme }) => theme.colors.fg.secondary};
  }
`;
