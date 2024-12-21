import React, { createContext, useEffect, useState } from 'react';
import { validateToken, getToken, removeToken } from './authService';

interface User {
  id: number;
  name: string;
  role: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      const token = getToken();
      if (token) {
        const userData = await validateToken(token);
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          removeToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  function login(token: string, userData: User) {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  }

  function logout() {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
