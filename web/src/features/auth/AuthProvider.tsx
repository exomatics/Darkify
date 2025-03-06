import React, { useEffect, useState } from 'react';
import { validateToken, getToken, removeToken } from './authService';
import { AuthContext } from './AuthContext';

export interface User {
  id: number;
  name: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean | null;
  user: User | null;
  login: (loginOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAuth() {
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
    }
    checkAuth();
  }, []);

  async function login(loginOrEmail: string, password: string) {
    if (loginOrEmail === 'test@darkify.com' && password === '123') {
      localStorage.setItem('token', 'validToken123');
      setIsAuthenticated(true);
      setUser({ id: 1, name: 'John Doe' });
      return true;
    }
    return false;
  }

  function logout() {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
