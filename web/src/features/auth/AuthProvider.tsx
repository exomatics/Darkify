import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from './authService.ts';
import { UserInfo } from '../../api/gen';
import { api, getStoredToken, removeToken, setToken } from '../../api/api.ts';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserInfo | undefined>();
  const [currentUserToken, setCurrentUserToken] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const doLogin = async () => {
      const token = getStoredToken();
      if (token) {
        setToken(token);
        const userInfo = await api.user.getUsersMe();
        setCurrentUser(userInfo);
        setCurrentUserToken(token);
      }
      setInitialized(true);
    };
    doLogin().then(() => void 0);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const loginData = await authService.login(emailOrUsername, password);
    if (!loginData) return;
    setCurrentUser(loginData.user);
    setCurrentUserToken(loginData.token);
  };

  const register = (emailOrUsername: string, password: string) => {
    const registerData = authService.register(emailOrUsername, password);
    setCurrentUser(registerData.user);
    setCurrentUserToken(registerData.token);
  };

  const logout = () => {
    setCurrentUser(undefined);
    setCurrentUserToken(undefined);
    removeToken();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserToken: currentUserToken ?? '',
        login,
        register,
        logout,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
