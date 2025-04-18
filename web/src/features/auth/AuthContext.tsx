import { createContext } from 'react';
import { User } from './authService.ts';

export type AuthContextValue = {
  currentUser: User;
  currentUserToken: string;
  login: (emailOrUsername: string, password: string) => void;
  register: (emailOrUsername: string, password: string) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
