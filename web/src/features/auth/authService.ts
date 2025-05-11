import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { api, initApiClient } from '../../api/api.ts';
import { UserInfo } from '../../api/gen';

export class AuthService {
  async login(emailOrUsername: string, password: string) {
    const tokenData = await api.auth.postUsersLogin({ email: emailOrUsername, password });
    if (!tokenData.token) return;
    initApiClient(tokenData.token);
    const user = await api.user.getUsersMe();
    if (!user) return;
    return {
      user,
      token: tokenData.token,
    };
  }

  register(emailOrUsername: string, password: string) {
    // TODO: make request to register. Get accessToken.
    const token = 'temp valid token';
    // TODO: make request ot get user
    const user: UserInfo = {
      userId: `123123${password}`,
      visible_username: `Test User ${emailOrUsername}`,
      avatar_url: 'https://placehold.co/400',
      followers: 255,
    };
    return {
      user,
      token,
    };
  }
}

export const authService = new AuthService();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('auth context must be initialized');
  }
  return ctx;
};
