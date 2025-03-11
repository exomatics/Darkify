import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextValue } from './AuthProvider';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export async function validateToken(token: string) {
  if (token === 'validToken123') {
    return { id: 1, name: 'John Doe' };
  }
  return null;
}

export async function loginToServer(username: string, password: string) {
  if (username === 'test@darkify.com' && password === '123') {
    return { token: 'validToken123', user: { id: 1, name: 'John Doe' } };
  }
  return null;
}

export const useAuth = () => {
  const context = useContext<AuthContextValue>(AuthContext);
  return context;
};
