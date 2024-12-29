import { createContext } from 'react';
import { AuthContextValue } from './AuthProvider';

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  login: (loginOrEmail: string, password: string) => Promise.resolve(false),
  logout: () => {},
});
