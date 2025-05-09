import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from './authService.ts';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [currentUserToken, setCurrentUserToken] = useState<string | undefined>(undefined);

  const login = (emailOrUsername: string, password: string) => {
    const loginData = authService.login(emailOrUsername, password);
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
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserToken: currentUserToken ?? '',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
