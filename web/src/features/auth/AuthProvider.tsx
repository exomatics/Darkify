import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from './authService.ts';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [currentUserToken, setCurrentUserToken] = useState<string | undefined>(null);

  const login = (emailOrUsername: string, password: string) => {
    const user = authService.login(emailOrUsername, password);
    setCurrentUser(user);
    setCurrentUserToken(authService.currentAccessToken);
  };

  const register = (emailOrUsername: string, password: string) => {
    const user = authService.register(emailOrUsername, password);
    setCurrentUser(user);
    setCurrentUserToken(authService.currentAccessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserToken,
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
