import { useContext } from 'react';
import { AuthContext, AuthContextValue } from './AuthContext';

export interface User {
  userId: string;
  visible_username: string;
  avatar_url: string;
  followers: number;
}

export class AuthService {
  currentAccessToken?: string;
  currentUser?: User;

  login(emailOrUsername: string, password: string) {
    // TODO: make request to login. Get accessToken.
    this.currentAccessToken = 'tempvalidtoken';
    // TODO: make request ot get user
    this.currentUser = {
      userId: `123123${password}`,
      visible_username: `Test User ${emailOrUsername}`,
      avatar_url: 'https://placehold.co/400',
      followers: 255,
    };
    return this.currentUser;
  }

  register(emailOrUsername: string, password: string) {
    // TODO: make request to register. Get accessToken.
    this.currentAccessToken = 'tempvalidtoken';
    // TODO: make request ot get user
    this.currentUser = {
      userId: `123123${password}`,
      visible_username: `Test User ${emailOrUsername}`,
      avatar_url: 'https://placehold.co/400',
      followers: 255,
    };
    return this.currentUser;
  }
}

export const authService = new AuthService();

export const useAuth = () => {
  return useContext<AuthContextValue>(AuthContext);
};
