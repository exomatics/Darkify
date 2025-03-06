import { createContext } from 'react';
import { AuthContextValue } from './AuthProvider';

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  // temp lint fix
  login: (loginOrEmail: string, password: string) => Promise.resolve(loginOrEmail === password),
  logout: () => {},
});
