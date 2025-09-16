import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../api/api.ts';

export const useLocalModel = () => {
  const userInfo = useQuery({
    queryKey: ['user-info', 'me'],
    queryFn: () => api.user.getUsersMe(),
  });

  const updateInfoMutation = useMutation({
    mutationFn: (info: { visible_username?: string }) =>
      api.user.putUsersMe({ visible_username: info.visible_username }),
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (formData: { avatar: File }) => api.user.putUsersMeAvatar(formData),
  });

  return {
    userInfo: userInfo.data,
    updateInfo: updateInfoMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
  };
};
