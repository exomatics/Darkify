import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export interface User {
  userId: string;
  visible_username: string;
  avatar_url: string;
  followers: number;
}

export class AuthService {
  login(emailOrUsername: string, password: string) {
    // TODO: make request to login. Get accessToken.
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
