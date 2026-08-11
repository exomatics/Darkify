import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/api.ts';

export const useLocalModel = () => {
  const queryClient = useQueryClient();

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

  const turnToArtistMutation = useMutation({
    mutationFn: (data: { description?: string; banner?: File }) =>
      api.user.postUsersMeTurnToArtist(data.banner ? data : { description: data.description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-info', 'me'] }),
  });

  return {
    userInfo: userInfo.data,
    updateInfo: updateInfoMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
    turnToArtist: turnToArtistMutation.mutateAsync,
  };
};
