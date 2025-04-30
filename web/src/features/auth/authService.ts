import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import {api, initApiClient} from "../../api/api.ts";

export class AuthService {
  async login(emailOrUsername: string, password: string) {
    const token = await api.auth.postUsersLogin({email: emailOrUsername, password})
    initApiClient(token.accessToken.token.split(' ')[1] ?? '');
    const user = await api.user.getUsersMe()
    return {
      user,
      token: token.token,
    };
  }

  register(emailOrUsername: string, password: string) {
    // TODO: make request to register. Get accessToken.
    const token = 'tempvalidtoken';
    // TODO: make request ot get user
    const user: User = {
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
