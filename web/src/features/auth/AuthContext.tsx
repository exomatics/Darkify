import { createContext } from 'react';
import { UserInfo } from '../../api/gen';

export type AuthContextValue = {
  currentUser: UserInfo | undefined;
  currentUserToken: string;
  login: (emailOrUsername: string, password: string) => void;
  register: (emailOrUsername: string, password: string) => void;
  logout: () => void;
  initialized: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
